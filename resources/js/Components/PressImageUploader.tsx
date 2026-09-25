import { useEffect, useRef, useState } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Props = {
    pressId: number;
    label?: string;
    existing?: ImageItem | null;
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function PressImageUploader({
    pressId,
    label = 'Cover image',
    existing = null,
}: Props) {
    const [item, setItem] = useState<ImageItem | null>(existing);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setItem(existing);
    }, [existing]);

    const base = `/admin/press/${pressId}/images`;

    const upload = (files: FileList | null) => {
        if (!files?.length) return;

        setBusy(true);
        setError('');
        setProgress(0);
        setMessage('Uploading…');

        const form = new FormData();
        form.append('files[]', files[0]);
        form.append('collection', 'cover');

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
                    if (json.cover) setItem(json.cover as ImageItem);
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
        setError('');
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
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
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
            <p className="mb-3 text-xs text-slate-500">jpeg / png / webp up to 50MB.</p>
            {error && <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>}
            {message && <p className="mb-2 text-xs text-emerald-700">{message}</p>}
            {busy && (
                <div className="mb-3 h-2 overflow-hidden rounded bg-slate-200">
                    <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
                </div>
            )}
            {!item ? (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="flex h-28 w-full items-center justify-center rounded border border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                    No cover yet — click to upload
                </button>
            ) : (
                <div className="max-w-xs overflow-hidden rounded border border-slate-200">
                    <a href={item.url} target="_blank" rel="noreferrer">
                        <img src={item.url} alt={item.name} className="h-40 w-full object-cover" />
                    </a>
                    <div className="flex items-center justify-between gap-2 p-2">
                        <p className="truncate text-[11px] text-slate-500">{item.name}</p>
                        <button
                            type="button"
                            className="rounded border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-600"
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
