import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Review = {
    id: number;
    star: number;
    review: string;
    name: string;
    location?: string | null;
    from?: string | null;
    status: string;
    created_at?: string | null;
    updated_at?: string | null;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-800">{children}</dd>
        </div>
    );
}

function formatStamp(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function Show({
    review,
    can,
}: {
    review: Review;
    can: { edit: boolean; delete: boolean };
}) {
    const [deleting, setDeleting] = useState(false);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/admin/reviews/${review.id}`, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Review</h2>}>
            <Head title={`Review — ${review.name}`} />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{review.name}</p>
                <div className="flex gap-2">
                    {can.edit && (
                        <Link
                            href={`/admin/reviews/${review.id}/edit`}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                        >
                            Edit
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            type="button"
                            onClick={() => setDeleting(true)}
                            className="rounded-md border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <dl>
                    <Row label="Star">{'★'.repeat(review.star)}</Row>
                    <Row label="Review">{review.review}</Row>
                    <Row label="Name">{review.name}</Row>
                    <Row label="Location">{review.location || '—'}</Row>
                    <Row label="From">{review.from || '—'}</Row>
                    <Row label="Status">
                        <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                review.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {review.status}
                        </span>
                    </Row>
                    <Row label="Created">{formatStamp(review.created_at)}</Row>
                    <Row label="Updated">{formatStamp(review.updated_at)}</Row>
                </dl>
            </div>

            <Modal show={deleting} onClose={() => !processing && setDeleting(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Delete review?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete the review from{' '}
                        <span className="font-medium text-slate-800">{review.name}</span>.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setDeleting(false)} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete review'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
