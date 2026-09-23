import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type UploadedMedia = {
    id: number;
    name: string;
    original: string;
    thumb?: string | null;
};

export default function Tester() {
    const [files, setFiles] = useState<FileList | null>(null);
    const [progress, setProgress] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [uploaded, setUploaded] = useState<UploadedMedia[]>([]);
    const [error, setError] = useState('');

    const upload = async () => {
        if (!files?.length) {
            setError('Select at least one image.');
            return;
        }

        setError('');
        setProcessing(true);
        setProgress(0);
        setMessage('Uploading…');

        const form = new FormData();
        Array.from(files).forEach((file) => form.append('files[]', file));
        form.append('collection', 'gallery');

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/admin/media-tester');
            xhr.setRequestHeader('X-CSRF-TOKEN', csrf);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const json = JSON.parse(xhr.responseText);
                        setUploaded(json.media ?? []);
                        setMessage(json.message ?? 'Upload complete. Conversions are processing in the queue.');
                    } catch {
                        setMessage('Upload complete. Conversions are processing in the queue.');
                    }
                    resolve();
                } else {
                    setError('Upload failed. Check file type (jpeg/png/webp) and size.');
                    reject(new Error('upload failed'));
                }
            };

            xhr.onerror = () => {
                setError('Network error during upload.');
                reject(new Error('network'));
            };

            xhr.send(form);
        }).finally(() => setProcessing(false));
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Media tester</h2>}>
            <Head title="Media tester" />
            <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
                <p className="text-sm text-slate-600">
                    Upload JPEG, PNG, or WebP images (max 50MB). Conversions queue automatically — run{' '}
                    <code className="rounded bg-slate-100 px-1">php artisan queue:work</code>.
                </p>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                />
                {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
                <button
                    type="button"
                    disabled={processing}
                    onClick={upload}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    {processing ? 'Uploading…' : 'Upload'}
                </button>
                {processing || progress > 0 ? (
                    <div>
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                            <span>{message || 'Processing'}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded bg-slate-200">
                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                ) : null}
                {message && !processing && <p className="text-sm text-emerald-700">{message}</p>}
                {uploaded.length > 0 && (
                    <ul className="space-y-2 text-sm">
                        {uploaded.map((item) => (
                            <li key={item.id} className="rounded border border-slate-200 p-3">
                                <div className="font-medium">{item.name}</div>
                                <a href={item.original} target="_blank" rel="noreferrer" className="text-indigo-600">
                                    Original
                                </a>
                                {item.thumb ? ' · thumb ready' : ' · thumb pending queue'}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}
