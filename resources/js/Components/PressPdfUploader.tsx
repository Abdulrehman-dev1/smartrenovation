import { useEffect, useRef, useState } from 'react';

type PdfItem = {
    path: string;
    url: string;
    name: string;
};

type Props = {
    pressId: number;
    existing?: PdfItem | null;
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function PressPdfUploader({ pressId, existing = null }: Props) {
    const [item, setItem] = useState<PdfItem | null>(existing);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setItem(existing);
    }, [existing]);

    const base = `/admin/press/${pressId}/pdf`;

    const upload = (files: FileList | null) => {
        if (!files?.length) return;

        setBusy(true);
        setError('');
        setProgress(0);
        setMessage('Uploading…');

        const form = new FormData();
        form.append('pdf', files[0]);

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
                    if (json.pdf) setItem(json.pdf as PdfItem);
                    setMessage(json.message ?? 'Uploaded.');
                } catch {
                    setMessage('Uploaded.');
                }
            } else {
                setError('Upload failed. Use a PDF under 50MB.');
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
            setError('Could not delete PDF.');
            return;
        }
        setItem(null);
        setMessage('PDF deleted.');
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">PDF file</h3>
                <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                    {busy ? 'Uploading…' : item ? 'Replace' : 'Upload'}
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        disabled={busy}
                        onChange={(e) => {
                            upload(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            <p className="mb-3 text-xs text-slate-500">
                Optional. When set, the public card prefers this PDF over the external URL.
            </p>
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
                    className="flex h-20 w-full items-center justify-center rounded border border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                    No PDF yet — click to upload
                </button>
            ) : (
                <div className="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2">
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm text-indigo-600 hover:underline"
                    >
                        {item.name}
                    </a>
                    <button
                        type="button"
                        className="rounded border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-600"
                        onClick={() => remove()}
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
}
