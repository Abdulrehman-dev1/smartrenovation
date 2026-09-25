import { useEffect, useRef, useState, type RefObject } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
    room: string;
};

type Props = {
    projectSlug: string;
    gallery: ImageItem[];
    galleryHidden: ImageItem[];
    imageRooms: string[];
    /** When false, room assignment UI is hidden (use the Rooms tab instead). */
    manageRooms?: boolean;
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function groupByRoom(
    items: ImageItem[],
    imageRooms: string[],
): { room: string; items: { item: ImageItem; index: number }[] }[] {
    const buckets = new Map<string, { item: ImageItem; index: number }[]>();
    imageRooms.forEach((room) => buckets.set(room, []));

    items.forEach((item, index) => {
        const room = imageRooms.includes(item.room) ? item.room : 'Other';
        if (!buckets.has(room)) {
            buckets.set(room, []);
        }
        buckets.get(room)!.push({ item, index });
    });

    return imageRooms
        .filter((room) => (buckets.get(room)?.length ?? 0) > 0)
        .map((room) => ({ room, items: buckets.get(room)! }));
}

function GalleryPanel({
    label,
    collection,
    items,
    imageRooms,
    manageRooms,
    selected,
    onToggle,
    onSelectAll,
    onClear,
    onUpload,
    onRemove,
    onMove,
    onTransfer,
    onAssignRoom,
    transferLabel,
    busy,
    progress,
    inputRef,
}: {
    label: string;
    collection: 'gallery' | 'gallery_hidden';
    items: ImageItem[];
    imageRooms: string[];
    manageRooms: boolean;
    selected: Set<string>;
    onToggle: (path: string) => void;
    onSelectAll: () => void;
    onClear: () => void;
    onUpload: (files: FileList | null) => void;
    onRemove: (path: string) => void;
    onMove: (index: number, direction: -1 | 1) => void;
    onTransfer: () => void;
    onAssignRoom: (room: string) => void;
    transferLabel: string;
    busy: boolean;
    progress: number;
    inputRef: RefObject<HTMLInputElement>;
}) {
    const selectedCount = items.filter((i) => selected.has(i.path)).length;
    const sections = manageRooms
        ? groupByRoom(items, imageRooms)
        : [{ room: '', items: items.map((item, index) => ({ item, index })) }];

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">JPEG, PNG, or WebP</p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
                    {busy ? 'Uploading…' : items.length ? 'Add more' : 'Upload'}
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={busy}
                        onChange={(e) => {
                            onUpload(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>

            {items.length > 0 && (
                <div
                    className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 ${
                        selectedCount > 0 ? 'border-indigo-100 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/80'
                    }`}
                >
                    <button
                        type="button"
                        onClick={onSelectAll}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                    >
                        Select all
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                    >
                        Clear
                    </button>
                    {selectedCount > 0 && (
                        <>
                            <span className="mx-1 h-4 w-px bg-slate-200" />
                            <span className="text-xs font-medium text-slate-700">{selectedCount} selected</span>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={onTransfer}
                                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                            >
                                {transferLabel}
                            </button>
                            {manageRooms && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Room:</span>
                                    {imageRooms.map((room) => (
                                        <button
                                            key={room}
                                            type="button"
                                            disabled={busy}
                                            onClick={() => onAssignRoom(room)}
                                            className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            {room}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="p-4">
                {busy && (
                    <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {items.length === 0 ? (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => inputRef.current?.click()}
                        className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-slate-400 shadow-sm">
                            +
                        </span>
                        Drop images here or click to browse
                    </button>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <section key={`${collection}-${section.room || 'all'}`}>
                                {manageRooms && section.room && (
                                    <div className="mb-3 flex items-center gap-3">
                                        <h4 className="text-xs font-semibold tracking-wide text-slate-800">{section.room}</h4>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                            {section.items.length}
                                        </span>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                )}
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                                    {section.items.map(({ item, index }) => {
                                        const isSelected = selected.has(item.path);
                                        return (
                                            <div
                                                key={item.path}
                                                className={`group overflow-hidden rounded-xl border bg-white transition ${
                                                    isSelected
                                                        ? 'border-slate-900 ring-2 ring-slate-900/15'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="relative aspect-square bg-slate-100">
                                                    <label className="absolute left-2 top-2 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-md bg-white/95 shadow-sm ring-1 ring-slate-200/80">
                                                        <input
                                                            type="checkbox"
                                                            className="size-3.5 rounded border-slate-400 text-slate-900 focus:ring-0 focus:ring-offset-0"
                                                            checked={isSelected}
                                                            onChange={() => onToggle(item.path)}
                                                        />
                                                    </label>
                                                    {manageRooms && (
                                                        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                                            {item.room}
                                                        </span>
                                                    )}
                                                    <img
                                                        src={item.url}
                                                        alt={item.name}
                                                        className="h-full w-full cursor-pointer object-cover"
                                                        onClick={() => onToggle(item.path)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5">
                                                    <p className="min-w-0 flex-1 truncate text-[11px] text-slate-500" title={item.name}>
                                                        {item.name}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                                                        onClick={() => onMove(index, -1)}
                                                        disabled={index === 0}
                                                        title="Move earlier"
                                                    >
                                                        ←
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                                                        onClick={() => onMove(index, 1)}
                                                        disabled={index === items.length - 1}
                                                        title="Move later"
                                                    >
                                                        →
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                                        onClick={() => onRemove(item.path)}
                                                        title="Remove"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => inputRef.current?.click()}
                            className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <span className="text-base leading-none">+</span>
                            Add more images
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProjectDualGallery({
    projectSlug,
    gallery,
    galleryHidden,
    imageRooms,
    manageRooms = true,
}: Props) {
    const [galleryItems, setGalleryItems] = useState(gallery);
    const [hiddenItems, setHiddenItems] = useState(galleryHidden);
    const [selectedGallery, setSelectedGallery] = useState<Set<string>>(new Set());
    const [selectedHidden, setSelectedHidden] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    const base = `/admin/projects/${projectSlug}/images`;
    const rooms = imageRooms.length ? imageRooms : ['Living', 'Kitchen', 'Dining', 'Bedroom', 'Bathroom', 'Outdoor', 'Other'];

    useEffect(() => {
        setGalleryItems(gallery);
        setHiddenItems(galleryHidden);
    }, [gallery, galleryHidden]);

    /** Stay under PHP max_file_uploads (often 20) by uploading in batches. */
    const UPLOAD_CHUNK = 15;

    const uploadChunk = (collection: 'gallery' | 'gallery_hidden', chunk: File[]) =>
        new Promise<{ images: ImageItem[]; message?: string }>((resolve, reject) => {
            const form = new FormData();
            chunk.forEach((file) => {
                form.append('files[]', file);
                form.append('rooms[]', 'Other');
            });
            form.append('collection', collection);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', base);
            xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    // Progress within current chunk only; overall set by caller.
                    setProgress(Math.round((event.loaded / event.total) * 100));
                }
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const json = JSON.parse(xhr.responseText);
                        resolve({
                            images: (json.images ?? []) as ImageItem[],
                            message: json.message,
                        });
                    } catch {
                        resolve({ images: [] });
                    }
                } else {
                    reject(new Error('upload_failed'));
                }
            };
            xhr.onerror = () => reject(new Error('network'));
            xhr.send(form);
        });

    const upload = async (collection: 'gallery' | 'gallery_hidden', files: FileList | null) => {
        if (!files?.length) return;
        const all = Array.from(files);
        setBusy(true);
        setError('');
        setProgress(0);
        setMessage(`Uploading 0 / ${all.length}…`);

        try {
            let lastImages: ImageItem[] | null = null;
            for (let i = 0; i < all.length; i += UPLOAD_CHUNK) {
                const chunk = all.slice(i, i + UPLOAD_CHUNK);
                const done = Math.min(i + chunk.length, all.length);
                setMessage(`Uploading ${done} / ${all.length}…`);
                const result = await uploadChunk(collection, chunk);
                lastImages = result.images;
                if (collection === 'gallery') setGalleryItems(result.images);
                else setHiddenItems(result.images);
                setProgress(Math.round((done / all.length) * 100));
            }
            setMessage(
                lastImages
                    ? `Uploaded ${all.length} image${all.length === 1 ? '' : 's'}.`
                    : 'Uploaded.',
            );
        } catch (err) {
            setError(
                err instanceof Error && err.message === 'network'
                    ? 'Network error during upload.'
                    : 'Upload failed. Use jpeg/png/webp under 50MB.',
            );
        } finally {
            setBusy(false);
        }
    };

    const remove = async (collection: 'gallery' | 'gallery_hidden', path: string) => {
        const res = await fetch(base, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ path, collection }),
        });
        if (!res.ok) {
            setError('Could not delete image.');
            return;
        }
        if (collection === 'gallery') {
            setGalleryItems((prev) => prev.filter((i) => i.path !== path));
            setSelectedGallery((prev) => {
                const next = new Set(prev);
                next.delete(path);
                return next;
            });
        } else {
            setHiddenItems((prev) => prev.filter((i) => i.path !== path));
            setSelectedHidden((prev) => {
                const next = new Set(prev);
                next.delete(path);
                return next;
            });
        }
        setMessage('Image deleted.');
    };

    const reorder = async (collection: 'gallery' | 'gallery_hidden', items: ImageItem[], index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        if (collection === 'gallery') setGalleryItems(next);
        else setHiddenItems(next);

        const res = await fetch(`${base}/reorder`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                collection,
                ordered_paths: next.map((i) => i.path),
            }),
        });
        if (!res.ok) {
            setError('Could not reorder images.');
            if (collection === 'gallery') setGalleryItems(items);
            else setHiddenItems(items);
        }
    };

    const transfer = async (from: 'gallery' | 'gallery_hidden', to: 'gallery' | 'gallery_hidden') => {
        const selected = from === 'gallery' ? selectedGallery : selectedHidden;
        if (!selected.size) return;

        setBusy(true);
        setError('');
        const res = await fetch(`${base}/transfer`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                from,
                to,
                paths: Array.from(selected),
            }),
        });
        setBusy(false);

        if (!res.ok) {
            setError('Could not move images.');
            return;
        }

        const json = (await res.json()) as {
            gallery: ImageItem[];
            gallery_hidden: ImageItem[];
            message?: string;
        };
        setGalleryItems(json.gallery ?? []);
        setHiddenItems(json.gallery_hidden ?? []);
        setSelectedGallery(new Set());
        setSelectedHidden(new Set());
        setMessage(json.message ?? 'Images moved.');
    };

    const assignRoom = async (collection: 'gallery' | 'gallery_hidden', selected: Set<string>, room: string) => {
        if (!selected.size) return;
        setBusy(true);
        setError('');
        const res = await fetch(`${base}/rooms`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                collection,
                updates: Array.from(selected).map((path) => ({ path, room })),
            }),
        });
        setBusy(false);

        if (!res.ok) {
            setError('Could not update rooms.');
            return;
        }

        const json = (await res.json()) as {
            gallery: ImageItem[];
            gallery_hidden: ImageItem[];
            message?: string;
        };
        setGalleryItems(json.gallery ?? []);
        setHiddenItems(json.gallery_hidden ?? []);
        setSelectedGallery(new Set());
        setSelectedHidden(new Set());
        setMessage(json.message ?? 'Rooms updated.');
    };

    return (
        <div className="space-y-4">
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
            {message && <p className="text-xs text-emerald-700">{message}</p>}
            <GalleryPanel
                label="Gallery images"
                collection="gallery"
                items={galleryItems}
                imageRooms={rooms}
                manageRooms={manageRooms}
                selected={selectedGallery}
                onToggle={(path) =>
                    setSelectedGallery((prev) => {
                        const next = new Set(prev);
                        if (next.has(path)) next.delete(path);
                        else next.add(path);
                        return next;
                    })
                }
                onSelectAll={() => setSelectedGallery(new Set(galleryItems.map((i) => i.path)))}
                onClear={() => setSelectedGallery(new Set())}
                onUpload={(files) => upload('gallery', files)}
                onRemove={(path) => remove('gallery', path)}
                onMove={(index, dir) => reorder('gallery', galleryItems, index, dir)}
                onTransfer={() => transfer('gallery', 'gallery_hidden')}
                onAssignRoom={(room) => assignRoom('gallery', selectedGallery, room)}
                transferLabel="Move to hidden"
                busy={busy}
                progress={progress}
                inputRef={galleryInputRef}
            />
            <GalleryPanel
                label="Hidden gallery"
                collection="gallery_hidden"
                items={hiddenItems}
                imageRooms={rooms}
                manageRooms={manageRooms}
                selected={selectedHidden}
                onToggle={(path) =>
                    setSelectedHidden((prev) => {
                        const next = new Set(prev);
                        if (next.has(path)) next.delete(path);
                        else next.add(path);
                        return next;
                    })
                }
                onSelectAll={() => setSelectedHidden(new Set(hiddenItems.map((i) => i.path)))}
                onClear={() => setSelectedHidden(new Set())}
                onUpload={(files) => upload('gallery_hidden', files)}
                onRemove={(path) => remove('gallery_hidden', path)}
                onMove={(index, dir) => reorder('gallery_hidden', hiddenItems, index, dir)}
                onTransfer={() => transfer('gallery_hidden', 'gallery')}
                onAssignRoom={(room) => assignRoom('gallery_hidden', selectedHidden, room)}
                transferLabel="Move to gallery"
                busy={busy}
                progress={progress}
                inputRef={hiddenInputRef}
            />
        </div>
    );
}
