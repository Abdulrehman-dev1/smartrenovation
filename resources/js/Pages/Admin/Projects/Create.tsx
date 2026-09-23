import PendingImagePicker, { PendingImage, pendingToFiles, pendingToRooms } from '@/Components/PendingImagePicker';
import ProjectFormTabs, { useProjectFormTab } from '@/Components/ProjectFormTabs';
import RichTextEditor from '@/Components/RichTextEditor';
import TaxonomySelect, { type CategoryOption, type LocationOption } from '@/Components/TaxonomySelect';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState, type ReactNode } from 'react';

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

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function Create({
    categories: initialCategories,
    locations: initialLocations,
    image_rooms: imageRooms = ['Living', 'Kitchen', 'Dining', 'Bedroom', 'Bathroom', 'Outdoor', 'Other'],
}: {
    categories: CategoryOption[];
    locations: LocationOption[];
    rooms?: string[];
    image_rooms?: string[];
}) {
    const slugTouched = useRef(false);
    const [coverPending, setCoverPending] = useState<PendingImage[]>([]);
    const [galleryPending, setGalleryPending] = useState<PendingImage[]>([]);
    const [hiddenPending, setHiddenPending] = useState<PendingImage[]>([]);
    const [categories, setCategories] = useState(initialCategories);
    const [locations, setLocations] = useState(initialLocations);

    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        name: '',
        category_id: '' as string | number,
        location_id: '' as string | number,
        studio: '',
        subtitle: '',
        description: '',
        status: 'draft',
        published_at: '',
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        schema_json: '',
        cover: null as File | null,
        gallery: [] as File[],
        gallery_rooms: [] as string[],
        gallery_hidden_files: [] as File[],
        gallery_hidden_rooms: [] as string[],
    });

    const { tab, setTab, errorFlags } = useProjectFormTab(errors);

    const syncCover = (next: PendingImage[]) => {
        setCoverPending(next);
        setData('cover', pendingToFiles(next, false) as File | null);
    };

    const syncGallery = (next: PendingImage[]) => {
        setGalleryPending(next);
        setData({
            ...data,
            gallery: pendingToFiles(next, true) as File[],
            gallery_rooms: pendingToRooms(next),
            gallery_hidden_files: pendingToFiles(hiddenPending, true) as File[],
            gallery_hidden_rooms: pendingToRooms(hiddenPending),
            cover: pendingToFiles(coverPending, false) as File | null,
        });
    };

    const syncHidden = (next: PendingImage[]) => {
        setHiddenPending(next);
        setData({
            ...data,
            gallery: pendingToFiles(galleryPending, true) as File[],
            gallery_rooms: pendingToRooms(galleryPending),
            gallery_hidden_files: pendingToFiles(next, true) as File[],
            gallery_hidden_rooms: pendingToRooms(next),
            cover: pendingToFiles(coverPending, false) as File | null,
        });
    };

    const moveGalleryToHidden = (selected: PendingImage[]) => {
        const ids = new Set(selected.map((s) => s.id));
        const nextGallery = galleryPending.filter((i) => !ids.has(i.id));
        const nextHidden = [...hiddenPending, ...selected];
        setGalleryPending(nextGallery);
        setHiddenPending(nextHidden);
        setData({
            ...data,
            gallery: pendingToFiles(nextGallery, true) as File[],
            gallery_rooms: pendingToRooms(nextGallery),
            gallery_hidden_files: pendingToFiles(nextHidden, true) as File[],
            gallery_hidden_rooms: pendingToRooms(nextHidden),
            cover: pendingToFiles(coverPending, false) as File | null,
        });
    };

    const moveHiddenToGallery = (selected: PendingImage[]) => {
        const ids = new Set(selected.map((s) => s.id));
        const nextHidden = hiddenPending.filter((i) => !ids.has(i.id));
        const nextGallery = [...galleryPending, ...selected];
        setGalleryPending(nextGallery);
        setHiddenPending(nextHidden);
        setData({
            ...data,
            gallery: pendingToFiles(nextGallery, true) as File[],
            gallery_rooms: pendingToRooms(nextGallery),
            gallery_hidden_files: pendingToFiles(nextHidden, true) as File[],
            gallery_hidden_rooms: pendingToRooms(nextHidden),
            cover: pendingToFiles(coverPending, false) as File | null,
        });
    };

    const onNameChange = (name: string) => {
        if (slugTouched.current) {
            setData('name', name);
            return;
        }
        setData({
            ...data,
            name,
            slug: slugify(name),
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/projects', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create project</h2>}>
            <Head title="Create project" />
            <form onSubmit={submit} className="w-full space-y-4">
                <ProjectFormTabs tab={tab} onChange={setTab} errorFlags={errorFlags}>
                    {(active) => (
                        <>
                            <div className={active === 'details' ? 'space-y-4' : 'hidden'}>
                                <Field label="Name" error={errors.name}>
                                    <input
                                        className={inputClass(errors.name)}
                                        value={data.name}
                                        onChange={(e) => onNameChange(e.target.value)}
                                    />
                                </Field>
                                <Field label="Slug" error={errors.slug}>
                                    <input
                                        className={inputClass(errors.slug)}
                                        value={data.slug}
                                        onChange={(e) => {
                                            slugTouched.current = true;
                                            setData('slug', e.target.value);
                                        }}
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
                                <p className="text-xs text-slate-500">
                                    Works room filters use gallery image tags. Select images, then assign a room.
                                </p>
                                <PendingImagePicker
                                    label="Cover image"
                                    multiple={false}
                                    value={coverPending}
                                    onChange={syncCover}
                                    error={errors.cover}
                                />
                                <PendingImagePicker
                                    label="Gallery images"
                                    value={galleryPending}
                                    onChange={syncGallery}
                                    error={errors.gallery}
                                    transferLabel="Move to hidden"
                                    onTransferSelected={moveGalleryToHidden}
                                    imageRooms={imageRooms}
                                />
                                <PendingImagePicker
                                    label="Hidden gallery"
                                    value={hiddenPending}
                                    onChange={syncHidden}
                                    error={errors.gallery_hidden_files}
                                    transferLabel="Move to gallery"
                                    onTransferSelected={moveHiddenToGallery}
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
                                        placeholder='Leave empty for auto WebPage schema. Example: {"@context":"https://schema.org","@type":"WebPage"}'
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
                        {processing ? 'Saving…' : 'Create project'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
