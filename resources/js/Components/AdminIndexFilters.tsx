import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export type AdminFilterOption = { value: string; label: string };

export type AdminFilterField =
    | {
          key: string;
          type: 'search';
          placeholder?: string;
          className?: string;
      }
    | {
          key: string;
          type: 'select';
          label: string;
          options: AdminFilterOption[];
          className?: string;
      };

type Props = {
    url: string;
    filters: Record<string, string>;
    fields: AdminFilterField[];
};

function cleanParams(values: Record<string, string>) {
    const next: Record<string, string> = {};
    Object.entries(values).forEach(([key, value]) => {
        const trimmed = value.trim();
        if (trimmed !== '') next[key] = trimmed;
    });
    return next;
}

export default function AdminIndexFilters({ url, filters, fields }: Props) {
    const [values, setValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        fields.forEach((field) => {
            initial[field.key] = filters[field.key] ?? '';
        });
        return initial;
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipSync = useRef(false);

    useEffect(() => {
        if (skipSync.current) {
            skipSync.current = false;
            return;
        }
        const next: Record<string, string> = {};
        fields.forEach((field) => {
            next[field.key] = filters[field.key] ?? '';
        });
        setValues(next);
        // Sync from server filters only (avoid loop on fields identity).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const apply = (next: Record<string, string>) => {
        skipSync.current = true;
        router.get(url, cleanParams(next), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setField = (key: string, value: string, immediate = false) => {
        const next = { ...values, [key]: value };
        setValues(next);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (immediate) {
            apply(next);
            return;
        }

        debounceRef.current = setTimeout(() => apply(next), 300);
    };

    const hasActive = fields.some((field) => (values[field.key] ?? '').trim() !== '');

    const clearAll = () => {
        const next: Record<string, string> = {};
        fields.forEach((field) => {
            next[field.key] = '';
        });
        setValues(next);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        apply(next);
    };

    return (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                {fields.map((field) => {
                    if (field.type === 'search') {
                        return (
                            <div key={field.key} className={`min-w-0 flex-1 ${field.className ?? 'lg:min-w-[14rem]'}`}>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
                                <input
                                    type="search"
                                    value={values[field.key] ?? ''}
                                    placeholder={field.placeholder ?? 'Search…'}
                                    onChange={(e) => setField(field.key, e.target.value)}
                                    className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={field.key} className={`min-w-0 ${field.className ?? 'lg:w-44'}`}>
                            <label className="mb-1 block text-xs font-medium text-slate-500">{field.label}</label>
                            <select
                                value={values[field.key] ?? ''}
                                onChange={(e) => setField(field.key, e.target.value, true)}
                                className="block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">All</option>
                                {field.options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}

                {hasActive && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:mb-0"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export const STATUS_FILTER_OPTIONS: AdminFilterOption[] = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
];
