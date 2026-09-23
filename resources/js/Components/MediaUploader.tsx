import { useEffect, useState } from 'react';

type MediaItem = {
    id: number;
    name: string;
    thumb?: string | null;
    card?: string | null;
    large?: string | null;
    original: string;
    collection: string;
};

type Props = {
    modelType: 'service' | 'article' | 'collection_item';
    modelId: number;
    collection: 'cover' | 'gallery' | 'gallery_hidden';
    label: string;
    multiple?: boolean;
    existing?: MediaItem[];
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function MediaUploader({
    modelType,
    modelId,
    collection,
    label,
    multiple = true,
    existing = [],
}: Props) {
    const [items, setItems] = useState<MediaItem[]>(existing);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setItems(existing);
    }, [existing]);

    // Poll pending conversions for a short window after upload.
    useEffect(() => {
        const pending = items.filter((item) => !item.thumb && !item.card);
        if (!pending.length) return;

        const timer = window.setInterval(async () => {
            const updates = await Promise.all(
                pending.map(async (item) => {
                    try {
                        const res = await fetch(`/admin/media/${item.id}/status`, {
                            headers: { Accept: 'application/json' },
                        });
                        if (!res.ok) return item;
                        return (await res.json()) as MediaItem;
                    } catch {
                        return item;
                    }
                }),
            );

            setItems((prev) =>
                prev.map((item) => updates.find((u) => u.id === item.id) ?? item),
            );
        }, 2500);

        return () => window.clearInterval(timer);
    }, [items]);

    const upload = (files: FileList | null) => {
        if (!files?.length) return;

        setBusy(true);
        setError('');
        setProgress(0);
        setMessage('Uploading…');

        const form = new FormData();
        Array.from(files).forEach((file) => form.append('files[]', file));
        form.append('collection', collection);
        form.append('model_type', modelType);
        form.append('model_id', String(modelId));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/admin/media');
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                setProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            setBusy(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const json = JSON.parse(xhr.responseText);
                    const next = (json.media ?? []) as MediaItem[];
                    setItems((prev) => (collection === 'cover' ? next : [...prev, ...next]));
                    setMessage(json.message ?? 'Uploaded. Optimizations are queued.');
                } catch {
                    setMessage('Uploaded. Optimizations are queued.');
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

    const remove = async (id: number) => {
        setError('');
        const res = await fetch(`/admin/media/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (!res.ok) {
            setError('Could not delete image.');
            return;
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
        setMessage('Image deleted.');
    };

    const move = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        setItems(next);

        const res = await fetch('/admin/media/reorder', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ ordered_ids: next.map((i) => i.id) }),
        });

        if (!res.ok) {
            setError('Could not reorder images.');
            setItems(items);
        }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
                <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                    {busy ? 'Uploading…' : 'Upload'}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        multiple={multiple}
                        disabled={busy}
                        onChange={(e) => {
                            upload(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            <p className="mb-3 text-xs text-slate-500">
                Large originals (25MB+) are accepted. Run <code className="rounded bg-slate-100 px-1">php artisan queue:work</code>{' '}
                so thumb/card/large finish.
            </p>
            {error && <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>}
            {message && <p className="mb-2 text-xs text-emerald-700">{message}</p>}
            {busy && (
                <div className="mb-3 h-2 overflow-hidden rounded bg-slate-200">
                    <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
                </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((item, index) => {
                    const processing = !item.thumb && !item.card;
                    return (
                        <div key={item.id} className="overflow-hidden rounded border border-slate-200">
                            <a href={item.card || item.large || item.original} target="_blank" rel="noreferrer">
                                <img
                                    src={item.thumb || item.card || item.original}
                                    alt={item.name}
                                    className="h-28 w-full object-cover"
                                />
                            </a>
                            <div className="space-y-1 p-2">
                                <p className="truncate text-[11px] text-slate-500">
                                    {processing ? 'Processing…' : item.name}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {multiple && (
                                        <>
                                            <button
                                                type="button"
                                                className="rounded border px-1.5 py-0.5 text-[10px]"
                                                onClick={() => move(index, -1)}
                                                disabled={index === 0}
                                            >
                                                ←
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded border px-1.5 py-0.5 text-[10px]"
                                                onClick={() => move(index, 1)}
                                                disabled={index === items.length - 1}
                                            >
                                                →
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className="rounded border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-600"
                                        onClick={() => remove(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
