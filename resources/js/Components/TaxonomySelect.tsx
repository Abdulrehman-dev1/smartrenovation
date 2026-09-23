import Modal from '@/Components/Modal';
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

export type CategoryOption = {
    id: number;
    value: string;
    label: string;
    type_label?: string | null;
};

export type LocationOption = {
    id: number;
    name: string;
};

type Kind = 'category' | 'location';

type Props = {
    kind: Kind;
    value: number | '' | null;
    onChange: (id: number | '') => void;
    options: CategoryOption[] | LocationOption[];
    onOptionsChange: (options: CategoryOption[] | LocationOption[]) => void;
    error?: string;
    placeholder?: string;
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function optionLabel(kind: Kind, option: CategoryOption | LocationOption): string {
    return kind === 'category' ? (option as CategoryOption).label : (option as LocationOption).name;
}

async function apiJson<T>(url: string, method: string, body?: Record<string, unknown>): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message =
            (data as { message?: string }).message ||
            Object.values((data as { errors?: Record<string, string[]> }).errors ?? {})
                .flat()
                .join(' ') ||
            'Something went wrong.';
        throw new Error(message);
    }

    return data as T;
}

export default function TaxonomySelect({
    kind,
    value,
    onChange,
    options,
    onOptionsChange,
    error,
    placeholder,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState('');
    const [editor, setEditor] = useState<'create' | 'edit' | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);

    const selected = useMemo(
        () => options.find((o) => o.id === value) ?? null,
        [options, value]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => optionLabel(kind, o).toLowerCase().includes(q));
    }, [options, query, kind]);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [open]);

    const basePath = kind === 'category' ? '/admin/categories' : '/admin/locations';
    const emptyLabel = placeholder ?? (kind === 'category' ? 'Select category' : 'Select location');

    const openCreate = () => {
        setEditor('create');
        setEditingId(null);
        setName('');
        setSlug('');
        setSlugTouched(false);
        setFormError('');
        setOpen(false);
    };

    const openEdit = (option: CategoryOption | LocationOption) => {
        setEditor('edit');
        setEditingId(option.id);
        if (kind === 'category') {
            const c = option as CategoryOption;
            setName(c.label);
            setSlug(c.value);
        } else {
            const l = option as LocationOption;
            setName(l.name);
            setSlug('');
        }
        setSlugTouched(true);
        setFormError('');
        setOpen(false);
    };

    const closeEditor = () => {
        setEditor(null);
        setEditingId(null);
        setFormError('');
    };

    const onNameInput = (next: string) => {
        setName(next);
        if (kind === 'category' && !slugTouched) {
            setSlug(
                next
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
            );
        }
    };

    const save = async () => {
        if (!name.trim()) {
            setFormError('Name is required.');
            return;
        }
        if (kind === 'category' && !slug.trim()) {
            setFormError('Slug is required.');
            return;
        }
        setBusy(true);
        setFormError('');
        try {
            if (kind === 'category') {
                const payload = {
                    name: name.trim(),
                    slug: slug.trim(),
                };
                if (editor === 'create') {
                    const res = await apiJson<{ category: CategoryOption }>(basePath, 'POST', payload);
                    onOptionsChange([...(options as CategoryOption[]), res.category].sort((a, b) =>
                        a.label.localeCompare(b.label)
                    ));
                    onChange(res.category.id);
                } else if (editingId != null) {
                    const res = await apiJson<{ category: CategoryOption }>(
                        `${basePath}/${editingId}`,
                        'PUT',
                        payload
                    );
                    onOptionsChange(
                        (options as CategoryOption[])
                            .map((o) => (o.id === editingId ? res.category : o))
                            .sort((a, b) => a.label.localeCompare(b.label))
                    );
                }
            } else {
                const payload = { name: name.trim() };
                if (editor === 'create') {
                    const res = await apiJson<{ location: LocationOption }>(basePath, 'POST', payload);
                    onOptionsChange([...(options as LocationOption[]), res.location].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    ));
                    onChange(res.location.id);
                } else if (editingId != null) {
                    const res = await apiJson<{ location: LocationOption }>(
                        `${basePath}/${editingId}`,
                        'PUT',
                        payload
                    );
                    onOptionsChange(
                        (options as LocationOption[])
                            .map((o) => (o.id === editingId ? res.location : o))
                            .sort((a, b) => a.name.localeCompare(b.name))
                    );
                }
            }
            closeEditor();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Save failed.');
        } finally {
            setBusy(false);
        }
    };

    const onEditorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            void save();
        }
    };

    const confirmDelete = async () => {
        if (deleteId == null) return;
        setBusy(true);
        setFormError('');
        try {
            await apiJson(`${basePath}/${deleteId}`, 'DELETE');
            if (kind === 'category') {
                onOptionsChange((options as CategoryOption[]).filter((o) => o.id !== deleteId));
            } else {
                onOptionsChange((options as LocationOption[]).filter((o) => o.id !== deleteId));
            }
            if (value === deleteId) {
                onChange('');
            }
            setDeleteId(null);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Delete failed.');
        } finally {
            setBusy(false);
        }
    };

    const onTriggerKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
        }
    };

    const inputClass = error
        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500';

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm shadow-sm ${inputClass}`}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={onTriggerKey}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
                    {selected ? optionLabel(kind, selected) : emptyLabel}
                </span>
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-2">
                        <input
                            ref={searchRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                            placeholder="Search…"
                            className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <ul className="max-h-56 overflow-auto py-1" role="listbox">
                        <li>
                            <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                {emptyLabel}
                            </button>
                        </li>
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-slate-400">No matches</li>
                        )}
                        {filtered.map((option) => {
                            const active = option.id === value;
                            return (
                                <li key={option.id} className="group flex items-center gap-1 px-1">
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        className={`min-w-0 flex-1 rounded px-2 py-1.5 text-left text-sm ${
                                            active
                                                ? 'bg-indigo-50 font-medium text-indigo-700'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                        onClick={() => {
                                            onChange(option.id);
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                    >
                                        <span className="block truncate">{optionLabel(kind, option)}</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Edit"
                                        className="rounded p-1.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEdit(option);
                                        }}
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete"
                                        className="rounded p-1.5 text-slate-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(option.id);
                                            setOpen(false);
                                            setFormError('');
                                        }}
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-slate-100 p-1">
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                            onClick={openCreate}
                        >
                            <span className="text-lg leading-none">+</span>
                            Add {kind === 'category' ? 'category' : 'location'}
                        </button>
                    </div>
                </div>
            )}

            <Modal show={editor !== null} onClose={closeEditor} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {editor === 'create' ? 'Add' : 'Edit'}{' '}
                        {kind === 'category' ? 'category' : 'location'}
                    </h3>
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={name}
                                onChange={(e) => onNameInput(e.target.value)}
                                onKeyDown={onEditorKeyDown}
                                autoFocus
                            />
                        </div>
                        {kind === 'category' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Slug</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setSlug(e.target.value);
                                    }}
                                    onKeyDown={onEditorKeyDown}
                                />
                            </div>
                        )}
                        {formError && <p className="text-sm text-rose-600">{formError}</p>}
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeEditor}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void save()}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {busy ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={deleteId !== null} onClose={() => setDeleteId(null)} maxWidth="sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Delete {kind}?</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Projects using this {kind} will keep their other fields; the {kind} link will be
                        cleared.
                    </p>
                    {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteId(null)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={confirmDelete}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {busy ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
