import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Article = {
    id: number;
    slug: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    status: string;
    published_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
    schema_json?: string | null;
    cover?: ImageItem | null;
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
    article,
    can,
    publicUrl,
}: {
    article: Article;
    can: { edit: boolean; delete: boolean };
    publicUrl: string;
}) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [processing, setProcessing] = useState(false);

    const closeDeleteModal = () => {
        if (processing) {
            return;
        }
        setConfirmingDelete(false);
    };

    const confirmDelete = () => {
        setProcessing(true);
        router.delete(`/admin/articles/${article.slug}`, {
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
                    <h2 className="text-xl font-semibold text-slate-800">{article.title}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin/articles"
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                            Back
                        </Link>
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
                        >
                            {article.status === 'published' ? 'View public' : 'Preview site'}
                        </a>
                        {can.edit && (
                            <Link
                                href={`/admin/articles/${article.slug}/edit`}
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
            <Head title={article.title} />

            <div className="space-y-8">
                <section className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">Details</h3>
                    <dl className="space-y-3">
                        <Row label="Slug">{article.slug}</Row>
                        <Row label="Status">
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    article.status === 'published'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {article.status}
                            </span>
                        </Row>
                        <Row label="Subtitle">{article.subtitle}</Row>
                        <Row label="Published at">{formatStamp(article.published_at)}</Row>
                        <Row label="Created at">{formatStamp(article.created_at)}</Row>
                        <Row label="Updated at">{formatStamp(article.updated_at)}</Row>
                    </dl>
                </section>

                {article.description && (
                    <section className="rounded-lg border border-slate-200 bg-white p-6">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800">Description</h3>
                        <div
                            className="rich-content max-w-none text-slate-700"
                            dangerouslySetInnerHTML={{ __html: article.description }}
                        />
                    </section>
                )}

                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="text-sm font-semibold text-slate-800">Media</h3>
                    {article.cover ? (
                        <div>
                            <h4 className="mb-3 text-sm font-medium text-slate-700">Cover</h4>
                            <a href={article.cover.url} target="_blank" rel="noreferrer" className="inline-block">
                                <img
                                    src={article.cover.url}
                                    alt={article.title}
                                    className="max-h-80 w-full max-w-2xl rounded border border-slate-200 object-cover"
                                />
                            </a>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No cover image.</p>
                    )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">SEO</h3>
                    <dl className="space-y-3">
                        <Row label="Meta title">{article.meta_title}</Row>
                        <Row label="Meta description">{article.meta_description}</Row>
                        <Row label="Canonical">
                            {article.canonical_url ? (
                                <a
                                    href={article.canonical_url}
                                    className="text-indigo-600 hover:underline"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {article.canonical_url}
                                </a>
                            ) : null}
                        </Row>
                        <Row label="Schema JSON">
                            {article.schema_json ? (
                                <pre className="overflow-x-auto rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                                    {article.schema_json}
                                </pre>
                            ) : (
                                'Auto Article schema'
                            )}
                        </Row>
                    </dl>
                </section>
            </div>

            <Modal show={confirmingDelete} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Delete article?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete{' '}
                        <span className="font-medium text-slate-800">{article.title}</span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete article'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
