import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';

type FileItem = { path: string; url: string; name: string };

type Award = {
    id: number;
    title: string;
    organization?: string | null;
    year?: string | null;
    status: string;
    created_at?: string | null;
    updated_at?: string | null;
    cover?: FileItem | null;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-800 sm:col-span-2">{children || '—'}</dd>
        </div>
    );
}

function formatStamp(value?: string | null) {
    if (!value) return null;
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function Show({
    award,
    can,
}: {
    award: Award;
    can: { edit: boolean; delete: boolean };
}) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [processing, setProcessing] = useState(false);

    const closeDeleteModal = () => {
        if (processing) return;
        setConfirmingDelete(false);
    };

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/admin/awards/${award.id}`, {
            onFinish: () => {
                setProcessing(false);
                setConfirmingDelete(false);
            },
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-slate-800">{award.title}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin/awards"
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                            Back
                        </Link>
                        {can.edit && (
                            <Link
                                href={`/admin/awards/${award.id}/edit`}
                                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                            >
                                Edit
                            </Link>
                        )}
                        {can.delete && (
                            <button
                                type="button"
                                className="rounded-md border border-rose-200 px-3 py-1.5 text-sm text-rose-600"
                                onClick={() => setConfirmingDelete(true)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={award.title} />

            <div className="space-y-8">
                <section className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">Details</h3>
                    <dl className="space-y-3">
                        <Row label="Organization">{award.organization}</Row>
                        <Row label="Year">{award.year}</Row>
                        <Row label="Status">
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    award.status === 'published'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {award.status}
                            </span>
                        </Row>
                        <Row label="Created at">{formatStamp(award.created_at)}</Row>
                        <Row label="Updated at">{formatStamp(award.updated_at)}</Row>
                    </dl>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">Cover</h3>
                    {award.cover ? (
                        <a href={award.cover.url} target="_blank" rel="noreferrer" className="inline-block">
                            <img
                                src={award.cover.url}
                                alt={award.title}
                                className="max-h-80 w-full max-w-xl rounded border border-slate-200 object-cover"
                            />
                        </a>
                    ) : (
                        <p className="text-sm text-slate-500">No cover image.</p>
                    )}
                </section>
            </div>

            <Modal show={confirmingDelete} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Delete award?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete{' '}
                        <span className="font-medium text-slate-800">{award.title}</span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete award'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
