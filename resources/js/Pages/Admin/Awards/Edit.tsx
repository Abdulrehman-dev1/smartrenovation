import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, type ReactNode } from 'react';

type FileItem = { path: string; url: string; name: string };

type Award = {
    id: number;
    title: string;
    organization?: string | null;
    year?: string | null;
    status: string;
    created_at?: string | null;
    updated_at?: string | null;
    cover?: FileItem | null;
};

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}

const inputClass = (hasError?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
        hasError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
    }`;

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function AwardImageUploader({
    awardId,
    existing,
}: {
    awardId: number;
    existing?: FileItem | null;
}) {
    const [item, setItem] = useState<FileItem | null>(existing ?? null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setItem(existing ?? null);
    }, [existing]);

    const base = `/admin/awards/${awardId}/images`;

    const upload = (files: FileList | null) => {
        if (!files?.length) return;
        setBusy(true);
        setError('');
        setMessage('Uploading…');

        const form = new FormData();
        form.append('files[]', files[0]);
        form.append('collection', 'cover');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', base);
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = () => {
            setBusy(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const json = JSON.parse(xhr.responseText);
                    if (json.cover) setItem(json.cover as FileItem);
                    setMessage(json.message ?? 'Uploaded.');
                } catch {
                    setMessage('Uploaded.');
                }
            } else {
                setError('Upload failed. Use jpeg/png/webp under 50MB.');
            }
        };
        xhr.onerror = () => {
            setBusy(false);
            setError('Network error during upload.');
        };
        xhr.send(form);
    };

    const remove = async () => {
        const res = await fetch(base, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({}),
        });
        if (!res.ok) {
            setError('Could not delete image.');
            return;
        }
        setItem(null);
        setMessage('Image deleted.');
    };

    return (
        <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Cover image</h3>
                <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                    {busy ? 'Uploading…' : item ? 'Replace' : 'Upload'}
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={busy}
                        onChange={(e) => {
                            upload(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            {error && <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>}
            {message && <p className="mb-2 text-xs text-emerald-700">{message}</p>}
            {!item ? (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="flex h-28 w-full items-center justify-center rounded border border-dashed border-slate-300 text-sm text-slate-500"
                >
                    No cover yet — click to upload
                </button>
            ) : (
                <div className="max-w-xs overflow-hidden rounded border">
                    <img src={item.url} alt={item.name} className="h-40 w-full object-cover" />
                    <div className="flex items-center justify-between p-2">
                        <p className="truncate text-[11px] text-slate-500">{item.name}</p>
                        <button
                            type="button"
                            className="text-[10px] text-rose-600"
                            onClick={() => remove()}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatStamp(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function Edit({ award }: { award: Award }) {
    const { data, setData, put, processing, errors } = useForm({
        title: award.title ?? '',
        organization: award.organization ?? '',
        year: award.year ?? '',
        status: award.status ?? 'draft',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/awards/${award.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit award</h2>}>
            <Head title={`Edit ${award.title}`} />
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <Field label="Title" error={errors.title}>
                        <input
                            className={inputClass(errors.title)}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                    </Field>
                    <Field label="Organization" error={errors.organization}>
                        <input
                            className={inputClass(errors.organization)}
                            value={data.organization}
                            onChange={(e) => setData('organization', e.target.value)}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Year" error={errors.year}>
                            <input
                                className={inputClass(errors.year)}
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                            />
                        </Field>
                        <Field label="Status" error={errors.status}>
                            <select
                                className={inputClass(errors.status)}
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </Field>
                    </div>
                    <AwardImageUploader awardId={award.id} existing={award.cover ?? null} />
                    {(errors as Record<string, string | undefined>).cover && (
                        <p className="text-xs font-medium text-rose-600">
                            {(errors as Record<string, string | undefined>).cover}
                        </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Created at</p>
                            <p className="mt-1 text-sm text-slate-500">{formatStamp(award.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Updated at</p>
                            <p className="mt-1 text-sm text-slate-500">{formatStamp(award.updated_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
