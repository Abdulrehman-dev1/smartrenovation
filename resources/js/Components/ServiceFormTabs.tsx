import { useEffect, useMemo, useState, type ReactNode } from 'react';

export type ServiceFormTab = 'details' | 'images' | 'seo';

const TABS: { id: ServiceFormTab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'images', label: 'Images' },
    { id: 'seo', label: 'SEO' },
];

const DETAIL_KEYS = [
    'title',
    'slug',
    'subtitle',
    'short_description',
    'description',
    'status',
    'published_at',
];
const IMAGE_KEYS = ['cover', 'gallery'];
const SEO_KEYS = ['meta_title', 'meta_description', 'canonical_url', 'schema_json'];

function tabHasErrors(errors: Record<string, string | undefined>, keys: string[]) {
    return keys.some((key) => Boolean(errors[key]));
}

export function useServiceFormTab(errors: Record<string, string | undefined>) {
    const [tab, setTab] = useState<ServiceFormTab>('details');

    const errorFlags = useMemo(
        () => ({
            details: tabHasErrors(errors, DETAIL_KEYS),
            images: tabHasErrors(errors, IMAGE_KEYS),
            seo: tabHasErrors(errors, SEO_KEYS),
        }),
        [errors],
    );

    useEffect(() => {
        if (errorFlags.details) setTab('details');
        else if (errorFlags.images) setTab('images');
        else if (errorFlags.seo) setTab('seo');
    }, [errorFlags.details, errorFlags.images, errorFlags.seo]);

    return { tab, setTab, errorFlags };
}

export default function ServiceFormTabs({
    tab,
    onChange,
    errorFlags,
    children,
}: {
    tab: ServiceFormTab;
    onChange: (tab: ServiceFormTab) => void;
    errorFlags: Record<ServiceFormTab, boolean>;
    children: (active: ServiceFormTab) => ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-2 pt-2 sm:px-4">
                <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Service form sections">
                    {TABS.map((item) => {
                        const active = tab === item.id;
                        const hasError = errorFlags[item.id];
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onChange(item.id)}
                                className={`relative whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                                    active
                                        ? 'bg-white text-slate-900 shadow-[0_-1px_0_0_#fff]'
                                        : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {item.label}
                                    {hasError && (
                                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden />
                                    )}
                                </span>
                                {active && (
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 sm:p-6">{children(tab)}</div>
        </div>
    );
}
