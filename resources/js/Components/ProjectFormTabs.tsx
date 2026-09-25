import { useEffect, useMemo, useState, type ReactNode } from 'react';

export type ProjectFormTab = 'details' | 'images' | 'rooms' | 'collection' | 'seo';

const TABS: { id: ProjectFormTab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'images', label: 'Images' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'collection', label: 'Collection' },
    { id: 'seo', label: 'SEO' },
];

const DETAIL_KEYS = [
    'name',
    'slug',
    'category_id',
    'location_id',
    'studio',
    'subtitle',
    'description',
    'status',
    'published_at',
];
const IMAGE_KEYS = ['cover', 'gallery', 'gallery_rooms', 'gallery_hidden_files', 'gallery_hidden_rooms'];
const ROOM_KEYS = ['gallery_rooms', 'gallery_hidden_rooms'];
const COLLECTION_KEYS = ['collection_style', 'collection_images', 'collection_keys', 'collection_entries'];
const SEO_KEYS = ['meta_title', 'meta_description', 'canonical_url', 'schema_json'];

function tabHasErrors(errors: Record<string, string | undefined>, keys: string[]) {
    return keys.some((key) => Boolean(errors[key]) || Object.keys(errors).some((k) => k.startsWith(`${key}.`)));
}

export function useProjectFormTab(
    errors: Record<string, string | undefined>,
    options?: { collectionEnabled?: boolean; roomsEnabled?: boolean },
) {
    const [tab, setTab] = useState<ProjectFormTab>('details');
    const collectionEnabled = options?.collectionEnabled ?? true;
    const roomsEnabled = options?.roomsEnabled ?? true;

    const errorFlags = useMemo(
        () => ({
            details: tabHasErrors(errors, DETAIL_KEYS),
            images: tabHasErrors(errors, IMAGE_KEYS),
            rooms: tabHasErrors(errors, ROOM_KEYS),
            collection: tabHasErrors(errors, COLLECTION_KEYS),
            seo: tabHasErrors(errors, SEO_KEYS),
        }),
        [errors],
    );

    useEffect(() => {
        if (errorFlags.details) setTab('details');
        else if (errorFlags.images) setTab('images');
        else if (errorFlags.rooms && roomsEnabled) setTab('rooms');
        else if (errorFlags.collection && collectionEnabled) setTab('collection');
        else if (errorFlags.seo) setTab('seo');
    }, [
        errorFlags.details,
        errorFlags.images,
        errorFlags.rooms,
        errorFlags.collection,
        errorFlags.seo,
        collectionEnabled,
        roomsEnabled,
    ]);

    useEffect(() => {
        if (!collectionEnabled && tab === 'collection') {
            setTab('images');
        }
    }, [collectionEnabled, tab]);

    useEffect(() => {
        if (!roomsEnabled && tab === 'rooms') {
            setTab('images');
        }
    }, [roomsEnabled, tab]);

    return { tab, setTab, errorFlags };
}

export default function ProjectFormTabs({
    tab,
    onChange,
    errorFlags,
    collectionEnabled = true,
    roomsEnabled = true,
    children,
}: {
    tab: ProjectFormTab;
    onChange: (tab: ProjectFormTab) => void;
    errorFlags: Record<ProjectFormTab, boolean>;
    collectionEnabled?: boolean;
    roomsEnabled?: boolean;
    children: (active: ProjectFormTab) => ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-2 pt-2 sm:px-4">
                <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Project form sections">
                    {TABS.map((item) => {
                        const active = tab === item.id;
                        const hasError = errorFlags[item.id];
                        const disabled =
                            (item.id === 'collection' && !collectionEnabled) ||
                            (item.id === 'rooms' && !roomsEnabled);
                        const disabledHint =
                            item.id === 'collection'
                                ? 'Add images in the Images tab first.'
                                : item.id === 'rooms'
                                  ? 'Add gallery images in the Images tab first.'
                                  : undefined;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={disabled}
                                title={disabled ? disabledHint : undefined}
                                onClick={() => {
                                    if (!disabled) onChange(item.id);
                                }}
                                className={`relative whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                                    disabled
                                        ? 'cursor-not-allowed text-slate-300'
                                        : active
                                          ? 'bg-white text-slate-900 shadow-[0_-1px_0_0_#fff]'
                                          : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                                }`}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {item.label}
                                    {hasError && !disabled && (
                                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden />
                                    )}
                                </span>
                                {active && !disabled && (
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-900" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 sm:p-6">
                {tab === 'collection' && !collectionEnabled ? (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Add images in the Images tab first.
                    </p>
                ) : tab === 'rooms' && !roomsEnabled ? (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        Add gallery images in the Images tab first.
                    </p>
                ) : (
                    children(tab)
                )}
            </div>
        </div>
    );
}
