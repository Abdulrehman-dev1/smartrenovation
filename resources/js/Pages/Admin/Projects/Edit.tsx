import ProjectDualGallery from '@/Components/ProjectDualGallery';
import ProjectFormTabs, { useProjectFormTab } from '@/Components/ProjectFormTabs';
import ProjectImageUploader from '@/Components/ProjectImageUploader';
import RichTextEditor from '@/Components/RichTextEditor';
import TaxonomySelect, { type CategoryOption, type LocationOption } from '@/Components/TaxonomySelect';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, type ReactNode } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
    room?: string;
};

type Project = {
    id: number;
    slug: string;
    name: string;
    category_id?: number | null;
    location_id?: number | null;
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
    cover?: ImageItem | null;
    gallery?: ImageItem[];
    gallery_hidden?: ImageItem[];
};

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}

const inputClass = (hasError?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
        hasError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
    }`;

export default function Edit({
    project,
    categories: initialCategories,
    locations: initialLocations,
    image_rooms: imageRooms = ['Living', 'Kitchen', 'Dining', 'Bedroom', 'Bathroom', 'Outdoor', 'Other'],
}: {
    project: Project;
    categories: CategoryOption[];
    locations: LocationOption[];
    rooms?: string[];
    image_rooms?: string[];
}) {
    const [categories, setCategories] = useState(initialCategories);
    const [locations, setLocations] = useState(initialLocations);

    const { data, setData, put, processing, errors } = useForm({
        slug: project.slug ?? '',
        name: project.name ?? '',
        category_id: project.category_id ?? ('' as string | number),
        location_id: project.location_id ?? ('' as string | number),
        studio: project.studio ?? '',
        subtitle: project.subtitle ?? '',
        description: project.description ?? '',
        status: project.status ?? 'draft',
        published_at: project.published_at ?? '',
        meta_title: project.meta_title ?? '',
        meta_description: project.meta_description ?? '',
        canonical_url: project.canonical_url ?? '',
        schema_json: project.schema_json ?? '',
    });

    const { tab, setTab, errorFlags } = useProjectFormTab(errors);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/projects/${project.slug}`, { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit project</h2>}>
            <Head title={`Edit ${project.name}`} />
            <form onSubmit={submit} className="w-full space-y-4">
                <ProjectFormTabs tab={tab} onChange={setTab} errorFlags={errorFlags}>
                    {(active) => (
                        <>
                            <div className={active === 'details' ? 'space-y-4' : 'hidden'}>
                                <Field label="Name" error={errors.name}>
                                    <input
                                        className={inputClass(errors.name)}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                </Field>
                                <Field label="Slug" error={errors.slug}>
                                    <input
                                        className={inputClass(errors.slug)}
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                    />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field label="Category" error={errors.category_id}>
                                        <TaxonomySelect
                                            kind="category"
                                            value={data.category_id === '' ? '' : Number(data.category_id)}
                                            onChange={(id) => setData('category_id', id)}
                                            options={categories}
                                            onOptionsChange={(next) => setCategories(next as CategoryOption[])}
                                            error={errors.category_id}
                                        />
                                    </Field>
                                    <Field label="Location" error={errors.location_id}>
                                        <TaxonomySelect
                                            kind="location"
                                            value={data.location_id === '' ? '' : Number(data.location_id)}
                                            onChange={(id) => setData('location_id', id)}
                                            options={locations}
                                            onOptionsChange={(next) => setLocations(next as LocationOption[])}
                                            error={errors.location_id}
                                        />
                                    </Field>
                                    <Field label="Studio" error={errors.studio}>
                                        <input
                                            className={inputClass(errors.studio)}
                                            value={data.studio}
                                            onChange={(e) => setData('studio', e.target.value)}
                                        />
                                    </Field>
                                </div>

                                {(project.rooms ?? []).length > 0 && (
                                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                        Rooms from gallery tags:{' '}
                                        <span className="font-medium text-slate-800">
                                            {(project.rooms ?? []).join(', ')}
                                        </span>
                                    </p>
                                )}

                                <Field label="Subtitle" error={errors.subtitle}>
                                    <input
                                        className={inputClass(errors.subtitle)}
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                    />
                                </Field>
                                <Field label="Description" error={errors.description}>
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(html) => setData('description', html)}
                                        placeholder="Project description with headings, lists, links, images, and video…"
                                    />
                                </Field>
                                <Field label="Status" error={errors.status}>
                                    <select
                                        className={inputClass(errors.status)}
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </Field>
                            </div>

                            <div className={active === 'images' ? 'space-y-4' : 'hidden'}>
                                <ProjectImageUploader
                                    projectId={project.id}
                                    projectSlug={project.slug}
                                    collection="cover"
                                    label="Cover image"
                                    multiple={false}
                                    existing={project.cover ? [project.cover] : []}
                                />
                                <ProjectDualGallery
                                    projectSlug={project.slug}
                                    gallery={(project.gallery ?? []).map((g) => ({
                                        ...g,
                                        room: g.room ?? 'Other',
                                    }))}
                                    galleryHidden={(project.gallery_hidden ?? []).map((g) => ({
                                        ...g,
                                        room: g.room ?? 'Other',
                                    }))}
                                    imageRooms={imageRooms}
                                />
                            </div>

                            <div className={active === 'seo' ? 'space-y-4' : 'hidden'}>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <Field label="Meta title" error={errors.meta_title}>
                                        <input
                                            className={inputClass(errors.meta_title)}
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                        />
                                    </Field>
                                    <Field label="Canonical URL" error={errors.canonical_url}>
                                        <input
                                            className={inputClass(errors.canonical_url)}
                                            value={data.canonical_url}
                                            placeholder="https://…"
                                            onChange={(e) => setData('canonical_url', e.target.value)}
                                        />
                                    </Field>
                                </div>
                                <Field label="Meta description" error={errors.meta_description}>
                                    <textarea
                                        rows={3}
                                        className={inputClass(errors.meta_description)}
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                    />
                                </Field>
                                <Field label="Schema JSON-LD" error={errors.schema_json}>
                                    <textarea
                                        rows={6}
                                        className={`${inputClass(errors.schema_json)} font-mono text-xs`}
                                        value={data.schema_json}
                                        placeholder="Leave empty for auto WebPage schema"
                                        onChange={(e) => setData('schema_json', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Leave empty to use the automatic WebPage schema.
                                    </p>
                                </Field>
                            </div>
                        </>
                    )}
                </ProjectFormTabs>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
