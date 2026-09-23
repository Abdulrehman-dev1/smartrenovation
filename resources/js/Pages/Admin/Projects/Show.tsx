import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Project = {
    id: number;
    slug: string;
    name: string;
    studio?: string | null;
    rooms?: string[] | null;
    subtitle?: string | null;
    description?: string | null;
    status: string;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
    schema_json?: string | null;
    category_name?: string | null;
    location_name?: string | null;
    type_label?: string | null;
    cover?: ImageItem | null;
    gallery?: ImageItem[];
    gallery_hidden?: ImageItem[];
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-800 sm:col-span-2">{children || '—'}</dd>
        </div>
    );
}

function ImageGrid({ title, images }: { title: string; images: ImageItem[] }) {
    if (!images.length) {
        return (
            <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500">No images.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {title} ({images.length})
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {images.map((image) => (
                    <a
                        key={image.path}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded border border-slate-200"
                    >
                        <img src={image.url} alt={image.name} className="h-28 w-full object-cover" />
                        <p className="truncate px-2 py-1 text-[11px] text-slate-500">{image.name}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default function Show({
    project,
    can,
    publicUrl,
}: {
    project: Project;
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
        router.delete(`/admin/projects/${project.slug}`, {
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
                    <h2 className="text-xl font-semibold text-slate-800">{project.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin/projects"
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
                            {project.status === 'published' ? 'View public' : 'Preview site'}
                        </a>
                        {can.edit && (
                            <Link
                                href={`/admin/projects/${project.slug}/edit`}
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
            <Head title={project.name} />

            <div className="space-y-8">
                <section className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">Details</h3>
                    <dl className="space-y-3">
                        <Row label="Slug">{project.slug}</Row>
                        <Row label="Status">
                            <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    project.status === 'published'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {project.status}
                            </span>
                        </Row>
                        <Row label="Category">{project.category_name}</Row>
                        <Row label="Type">{project.type_label}</Row>
                        <Row label="Location">{project.location_name}</Row>
                        <Row label="Studio">{project.studio}</Row>
                        <Row label="Rooms">
                            {(project.rooms ?? []).length ? (project.rooms ?? []).join(', ') : null}
                        </Row>
                        <Row label="Subtitle">{project.subtitle}</Row>
                        <Row label="Published at">
                            {project.published_at
                                ? new Date(project.published_at).toLocaleString()
                                : null}
                        </Row>
                    </dl>
                </section>

                {project.description && (
                    <section className="rounded-lg border border-slate-200 bg-white p-6">
                        <h3 className="mb-4 text-sm font-semibold text-slate-800">Description</h3>
                        <div
                            className="rich-content max-w-none text-slate-700"
                            dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                    </section>
                )}

                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="text-sm font-semibold text-slate-800">Media</h3>
                    {project.cover && (
                        <div>
                            <h4 className="mb-3 text-sm font-medium text-slate-700">Cover</h4>
                            <a href={project.cover.url} target="_blank" rel="noreferrer" className="inline-block">
                                <img
                                    src={project.cover.url}
                                    alt={project.name}
                                    className="max-h-80 w-full max-w-2xl rounded border border-slate-200 object-cover"
                                />
                            </a>
                        </div>
                    )}
                    <ImageGrid title="Gallery" images={project.gallery ?? []} />
                    <ImageGrid title="Hidden gallery" images={project.gallery_hidden ?? []} />
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">SEO</h3>
                    <dl className="space-y-3">
                        <Row label="Meta title">{project.meta_title}</Row>
                        <Row label="Meta description">{project.meta_description}</Row>
                        <Row label="Canonical">
                            {project.canonical_url ? (
                                <a href={project.canonical_url} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">
                                    {project.canonical_url}
                                </a>
                            ) : null}
                        </Row>
                        <Row label="Schema JSON">
                            {project.schema_json ? (
                                <pre className="overflow-x-auto rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
                                    {project.schema_json}
                                </pre>
                            ) : (
                                'Auto WebPage schema'
                            )}
                        </Row>
                    </dl>
                </section>
            </div>

            <Modal show={confirmingDelete} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Delete project?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete{' '}
                        <span className="font-medium text-slate-800">{project.name}</span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete project'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
