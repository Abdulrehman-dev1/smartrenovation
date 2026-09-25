import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
    room?: string;
};

type CollectionImageItem = {
    path: string;
    url: string;
    name: string;
    style: string;
    ar?: number;
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
    collection_style?: string | null;
    collection_images?: CollectionImageItem[];
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-800 sm:col-span-2">{children || '—'}</dd>
        </div>
    );
}

function ImageGrid({
    title,
    images,
    badgeKey,
}: {
    title: string;
    images: Array<ImageItem | CollectionImageItem>;
    badgeKey?: 'room' | 'style';
}) {
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
                {images.map((image) => {
                    const badge =
                        badgeKey === 'room'
                            ? (image as ImageItem).room
                            : badgeKey === 'style'
                              ? (image as CollectionImageItem).style
                              : undefined;
                    return (
                        <a
                            key={image.path}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded border border-slate-200"
                        >
                            <div className="relative">
                                <img src={image.url} alt={image.name} className="h-28 w-full object-cover" />
                                {badge && (
                                    <span className="absolute bottom-1.5 left-1.5 max-w-[90%] truncate rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            <p className="truncate px-2 py-1 text-[11px] text-slate-500">{image.name}</p>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

function groupByLabel<T extends { path: string }>(
    images: T[],
    labelOf: (item: T) => string,
    order: string[],
): { label: string; images: T[] }[] {
    const buckets = new Map<string, T[]>();
    order.forEach((label) => buckets.set(label, []));

    images.forEach((item) => {
        const label = labelOf(item) || 'Other';
        if (!buckets.has(label)) buckets.set(label, []);
        buckets.get(label)!.push(item);
    });

    const ordered = order
        .filter((label) => (buckets.get(label)?.length ?? 0) > 0)
        .map((label) => ({ label, images: buckets.get(label)! }));

    const extras = [...buckets.keys()]
        .filter((label) => !order.includes(label) && (buckets.get(label)?.length ?? 0) > 0)
        .map((label) => ({ label, images: buckets.get(label)! }));

    return [...ordered, ...extras];
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

    const roomImages = useMemo(() => {
        const all = [...(project.gallery ?? []), ...(project.gallery_hidden ?? [])];
        return all.filter((img) => img.room && img.room !== 'Other');
    }, [project.gallery, project.gallery_hidden]);

    const roomSections = useMemo(() => {
        const order = ['Living', 'Kitchen', 'Dining', 'Bedroom', 'Bathroom', 'Outdoor', 'Other'];
        return groupByLabel(roomImages, (img) => img.room ?? 'Other', order);
    }, [roomImages]);

    const collectionSections = useMemo(() => {
        const images = project.collection_images ?? [];
        const order = [
            'Mediterranean',
            'Italian Heritage',
            'Oriental',
            'Modern Minimalist',
            'Glam Eclectic',
        ];
        return groupByLabel(images, (img) => img.style, order);
    }, [project.collection_images]);

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
                        <Row label="Collection style">{project.collection_style}</Row>
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
                    <ImageGrid title="Gallery" images={project.gallery ?? []} badgeKey="room" />
                    <ImageGrid title="Hidden gallery" images={project.gallery_hidden ?? []} badgeKey="room" />
                </section>

                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">Rooms</h3>
                        <p className="text-xs text-slate-500">
                            Gallery images tagged for Works room filters ({roomImages.length})
                        </p>
                    </div>
                    {roomSections.length === 0 ? (
                        <p className="text-sm text-slate-500">No room-tagged images yet.</p>
                    ) : (
                        roomSections.map((section) => (
                            <ImageGrid
                                key={section.label}
                                title={section.label}
                                images={section.images}
                                badgeKey="room"
                            />
                        ))
                    )}
                </section>

                <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">Collection</h3>
                        <p className="text-xs text-slate-500">
                            {project.collection_style
                                ? `Primary style: ${project.collection_style}`
                                : 'No collection style'}
                            {' · '}
                            {(project.collection_images ?? []).length} image
                            {(project.collection_images ?? []).length === 1 ? '' : 's'}
                        </p>
                    </div>
                    {collectionSections.length === 0 ? (
                        <p className="text-sm text-slate-500">No collection images yet.</p>
                    ) : (
                        collectionSections.map((section) => (
                            <ImageGrid
                                key={section.label}
                                title={section.label}
                                images={section.images}
                                badgeKey="style"
                            />
                        ))
                    )}
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <h3 className="mb-4 text-sm font-semibold text-slate-800">SEO</h3>
                    <dl className="space-y-3">
                        <Row label="Meta title">{project.meta_title}</Row>
                        <Row label="Meta description">{project.meta_description}</Row>
                        <Row label="Canonical">
                            {project.canonical_url ? (
                                <a
                                    href={project.canonical_url}
                                    className="text-indigo-600 hover:underline"
                                    target="_blank"
                                    rel="noreferrer"
                                >
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
