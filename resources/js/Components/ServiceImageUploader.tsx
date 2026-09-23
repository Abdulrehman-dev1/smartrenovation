import { useEffect, useRef, useState } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Props = {
    serviceSlug: string;
    collection: 'cover' | 'gallery';
    label: string;
    multiple?: boolean;
    existing?: ImageItem[];
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function ServiceImageUploader({
    serviceSlug,
    collection,
    label,
    multiple = true,
    existing = [],
}: Props) {
    const [items, setItems] = useState<ImageItem[]>(existing);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setItems(existing);
    }, [existing]);

    const base = `/admin/services/${serviceSlug}/images`;

    const upload = (files: FileList | null) => {
        if (!files?.length) return;

        setBusy(true);
        setError('');
        setProgress(0);
        setMessage('Uploading…');

        const form = new FormData();
        Array.from(files).forEach((file) => form.append('files[]', file));
        form.append('collection', collection);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', base);
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
                    if (collection === 'cover' && json.cover) {
                        setItems([json.cover]);
                    } else if (json.images) {
                        setItems(json.images as ImageItem[]);
                    }
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

    const remove = async (path: string) => {
        setError('');
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
        setItems((prev) => prev.filter((item) => item.path !== path));
        setMessage('Image deleted.');
    };

    const move = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        setItems(next);

        const res = await fetch(`${base}/reorder`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                ordered_paths: next.map((i) => i.path),
            }),
        });

        if (!res.ok) {
            setError('Could not reorder images.');
            setItems(items);
        }
    };

    const inputRef = useRef<HTMLInputElement>(null);
    const addLabel = busy
        ? 'Uploading…'
        : !multiple
          ? items.length
              ? 'Replace'
              : 'Upload'
          : items.length
            ? 'Add more'
            : 'Upload';

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
                <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                    {addLabel}
                    <input
                        ref={inputRef}
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
            <p className="mb-3 text-xs text-slate-500">jpeg / png / webp up to 50MB. Images are resized on upload.</p>
            {error && <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>}
            {message && <p className="mb-2 text-xs text-emerald-700">{message}</p>}
            {busy && (
                <div className="mb-3 h-2 overflow-hidden rounded bg-slate-200">
                    <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
                </div>
            )}
            {items.length === 0 ? (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="flex h-28 w-full items-center justify-center rounded border border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                    No images yet — click to upload
                </button>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {items.map((item, index) => (
                        <div key={item.path} className="overflow-hidden rounded border border-slate-200">
                            <a href={item.url} target="_blank" rel="noreferrer">
                                <img src={item.url} alt={item.name} className="h-28 w-full object-cover" />
                            </a>
                            <div className="space-y-1 p-2">
                                <p className="truncate text-[11px] text-slate-500">{item.name}</p>
                                <div className="flex flex-wrap gap-1">
                                    {multiple && (
                                        <>
                                            <button
                                                type="button"
                                                className="rounded border px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                                                onClick={() => move(index, -1)}
                                                disabled={index === 0}
                                                title="Move left"
                                            >
                                                ←
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded border px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                                                onClick={() => move(index, 1)}
                                                disabled={index === items.length - 1}
                                                title="Move right"
                                            >
                                                →
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className="rounded border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-600"
                                        onClick={() => remove(item.path)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {multiple && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => inputRef.current?.click()}
                            className="flex h-full min-h-[7rem] flex-col items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <span className="text-lg leading-none">+</span>
                            Add more
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
