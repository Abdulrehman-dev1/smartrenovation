import { useEffect, useMemo, useState, type ReactNode } from 'react';

export type PressFormTab = 'details' | 'media';

const TABS: { id: PressFormTab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'media', label: 'Media' },
];

const DETAIL_KEYS = ['title', 'outlet', 'href', 'status'];
const MEDIA_KEYS = ['cover', 'pdf'];

function tabHasErrors(errors: Record<string, string | undefined>, keys: string[]) {
    return keys.some((key) => Boolean(errors[key]));
}

export function usePressFormTab(errors: Record<string, string | undefined>) {
    const [tab, setTab] = useState<PressFormTab>('details');

    const errorFlags = useMemo(
        () => ({
            details: tabHasErrors(errors, DETAIL_KEYS),
            media: tabHasErrors(errors, MEDIA_KEYS),
        }),
        [errors],
    );

    useEffect(() => {
        if (errorFlags.details) setTab('details');
        else if (errorFlags.media) setTab('media');
    }, [errorFlags.details, errorFlags.media]);

    return { tab, setTab, errorFlags };
}

export default function PressFormTabs({
    tab,
    onChange,
    errorFlags,
    children,
}: {
    tab: PressFormTab;
    onChange: (tab: PressFormTab) => void;
    errorFlags: Record<PressFormTab, boolean>;
    children: (active: PressFormTab) => ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-2 pt-2 sm:px-4">
                <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Press form sections">
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
                                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900" />}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 sm:p-6">{children(tab)}</div>
        </div>
    );
}
