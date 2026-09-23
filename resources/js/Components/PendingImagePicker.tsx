import { useEffect, useId, useRef, useState } from 'react';

export type PendingImage = {
    id: string;
    file: File;
    preview: string;
    room: string;
};

type Props = {
    label: string;
    multiple?: boolean;
    value: PendingImage[];
    onChange: (next: PendingImage[]) => void;
    error?: string;
    accept?: string;
    transferLabel?: string;
    onTransferSelected?: (selected: PendingImage[]) => void;
    imageRooms?: string[];
};

const DEFAULT_ROOM = 'Other';

function makePending(files: File[], room = DEFAULT_ROOM): PendingImage[] {
    return files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        room,
    }));
}

function revokeAll(items: PendingImage[]) {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
}

function groupByRoom(
    items: PendingImage[],
    imageRooms: string[],
): { room: string; items: { item: PendingImage; index: number }[] }[] {
    const order = imageRooms.length ? imageRooms : [DEFAULT_ROOM];
    const buckets = new Map<string, { item: PendingImage; index: number }[]>();
    order.forEach((room) => buckets.set(room, []));

    items.forEach((item, index) => {
        const room = order.includes(item.room) ? item.room : DEFAULT_ROOM;
        if (!buckets.has(room)) buckets.set(room, []);
        buckets.get(room)!.push({ item, index });
    });

    return order
        .filter((room) => (buckets.get(room)?.length ?? 0) > 0)
        .map((room) => ({ room, items: buckets.get(room)! }));
}

export default function PendingImagePicker({
    label,
    multiple = true,
    value,
    onChange,
    error,
    accept = 'image/jpeg,image/png,image/webp',
    transferLabel,
    onTransferSelected,
    imageRooms,
}: Props) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const canTransfer = Boolean(multiple && transferLabel && onTransferSelected);
    const roomEnabled = Boolean(multiple && imageRooms?.length);
    const rooms = imageRooms ?? [];
    const selectable = canTransfer || roomEnabled;

    useEffect(() => {
        return () => {
            value.forEach((item) => URL.revokeObjectURL(item.preview));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSelected((prev) => {
            const ids = new Set(value.map((v) => v.id));
            const next = new Set<string>();
            prev.forEach((id) => {
                if (ids.has(id)) next.add(id);
            });
            return next;
        });
    }, [value]);

    const addFiles = (list: FileList | null) => {
        if (!list?.length) return;
        setLocalError('');
        const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
        if (!files.length) {
            setLocalError('Use jpeg, png, or webp images.');
            return;
        }

        const pending = makePending(files, DEFAULT_ROOM);
        if (!multiple) {
            revokeAll(value);
            onChange(pending.slice(0, 1));
            return;
        }
        onChange([...value, ...pending]);
    };

    const removeAt = (index: number) => {
        const next = [...value];
        const [removed] = next.splice(index, 1);
        if (removed) URL.revokeObjectURL(removed.preview);
        onChange(next);
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= value.length) return;
        const next = [...value];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        onChange(next);
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => setSelected(new Set(value.map((v) => v.id)));
    const clearSelection = () => setSelected(new Set());

    const doTransfer = () => {
        if (!onTransferSelected || selected.size === 0) return;
        onTransferSelected(value.filter((item) => selected.has(item.id)));
        setSelected(new Set());
    };

    const assignRoom = (room: string) => {
        if (!selected.size) return;
        onChange(value.map((item) => (selected.has(item.id) ? { ...item, room } : item)));
        setSelected(new Set());
    };

    const addLabel = !multiple
        ? value.length
            ? 'Replace'
            : 'Choose image'
        : value.length
          ? 'Add more'
          : 'Choose images';

    const sections = roomEnabled
        ? groupByRoom(value, rooms)
        : [{ room: '', items: value.map((item, index) => ({ item, index })) }];

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">JPEG, PNG, or WebP</p>
                </div>
                <label
                    htmlFor={inputId}
                    className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                    {addLabel}
                    <input
                        id={inputId}
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        multiple={multiple}
                        onChange={(e) => {
                            addFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>

            {selectable && value.length > 0 && (
                <div
                    className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 ${
                        selected.size > 0 ? 'border-indigo-100 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/80'
                    }`}
                >
                    <button
                        type="button"
                        onClick={selectAll}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                    >
                        Select all
                    </button>
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                    >
                        Clear
                    </button>
                    {selected.size > 0 && (
                        <>
                            <span className="mx-1 h-4 w-px bg-slate-200" />
                            <span className="text-xs font-medium text-slate-700">{selected.size} selected</span>
                            {canTransfer && (
                                <button
                                    type="button"
                                    onClick={doTransfer}
                                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                                >
                                    {transferLabel}
                                </button>
                            )}
                            {roomEnabled && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Room:</span>
                                    {rooms.map((room) => (
                                        <button
                                            key={room}
                                            type="button"
                                            onClick={() => assignRoom(room)}
                                            className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
                {(error || localError) && (
                    <p className="mb-3 text-xs font-medium text-rose-600">{error || localError}</p>
                )}

                {value.length === 0 ? (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-slate-400 shadow-sm">
                            +
                        </span>
                        Drop images here or click to browse
                    </button>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <section key={section.room || 'all'}>
                                {roomEnabled && section.room && (
                                    <div className="mb-3 flex items-center gap-3">
                                        <h4 className="text-xs font-semibold tracking-wide text-slate-800">
                                            {section.room}
                                        </h4>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                            {section.items.length}
                                        </span>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                )}
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                                    {section.items.map(({ item, index }) => (
                                        <ThumbCard
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            total={value.length}
                                            isSelected={selected.has(item.id)}
                                            selectable={selectable}
                                            showRoom={roomEnabled}
                                            onToggle={() => toggleSelect(item.id)}
                                            onMove={move}
                                            onRemove={removeAt}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                        {multiple && (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                <span className="text-base leading-none">+</span>
                                Add more images
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ThumbCard({
    item,
    index,
    total,
    isSelected,
    selectable,
    showRoom,
    onToggle,
    onMove,
    onRemove,
}: {
    item: PendingImage;
    index: number;
    total: number;
    isSelected: boolean;
    selectable: boolean;
    showRoom: boolean;
    onToggle: () => void;
    onMove: (index: number, direction: -1 | 1) => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div
            className={`group overflow-hidden rounded-xl border bg-white transition ${
                isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/15'
                    : 'border-slate-200 hover:border-slate-300'
            }`}
        >
            <div className="relative aspect-square bg-slate-100">
                {selectable && (
                    <label className="absolute left-2 top-2 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-md bg-white/95 shadow-sm ring-1 ring-slate-200/80">
                        <input
                            type="checkbox"
                            className="size-3.5 rounded border-slate-400 text-slate-900 focus:ring-0 focus:ring-offset-0"
                            checked={isSelected}
                            onChange={onToggle}
                        />
                    </label>
                )}
                {showRoom && (
                    <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {item.room}
                    </span>
                )}
                <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                    onClick={() => selectable && onToggle()}
                />
            </div>
            <div className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5">
                <p className="min-w-0 flex-1 truncate text-[11px] text-slate-500" title={item.file.name}>
                    {item.file.name}
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
                    disabled={index === total - 1}
                    title="Move later"
                >
                    →
                </button>
                <button
                    type="button"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => onRemove(index)}
                    title="Remove"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export function pendingToFiles(items: PendingImage[], multiple: boolean): File | File[] | null {
    if (!items.length) return multiple ? [] : null;
    if (!multiple) return items[0].file;
    return items.map((i) => i.file);
}

export function pendingToRooms(items: PendingImage[]): string[] {
    return items.map((i) => i.room || DEFAULT_ROOM);
}
