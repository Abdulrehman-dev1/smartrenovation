import PendingImagePicker, { PendingImage, pendingToFiles } from '@/Components/PendingImagePicker';
import RichTextEditor from '@/Components/RichTextEditor';
import ServiceFormTabs, { useServiceFormTab } from '@/Components/ServiceFormTabs';
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

export default function Create() {
    const slugTouched = useRef(false);
    const [coverPending, setCoverPending] = useState<PendingImage[]>([]);
    const [galleryPending, setGalleryPending] = useState<PendingImage[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
        subtitle: '',
        short_description: '',
        description: '',
        status: 'draft',
        published_at: '',
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        schema_json: '',
        cover: null as File | null,
        gallery: [] as File[],
    });

    const { tab, setTab, errorFlags } = useServiceFormTab(errors);

    const syncCover = (next: PendingImage[]) => {
        setCoverPending(next);
        setData('cover', pendingToFiles(next, false) as File | null);
    };

    const syncGallery = (next: PendingImage[]) => {
        setGalleryPending(next);
        setData({
            ...data,
            gallery: pendingToFiles(next, true) as File[],
            cover: pendingToFiles(coverPending, false) as File | null,
        });
    };

    const onTitleChange = (title: string) => {
        if (slugTouched.current) {
            setData('title', title);
            return;
        }
        setData({
            ...data,
            title,
            slug: slugify(title),
        });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/services', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create service</h2>}>
            <Head title="Create service" />
            <form onSubmit={submit} className="w-full space-y-4">
                <ServiceFormTabs tab={tab} onChange={setTab} errorFlags={errorFlags}>
                    {(active) => (
                        <>
                            <div className={active === 'details' ? 'space-y-4' : 'hidden'}>
                                <Field label="Title" error={errors.title}>
                                    <input
                                        className={inputClass(errors.title)}
                                        value={data.title}
                                        onChange={(e) => onTitleChange(e.target.value)}
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
                                <Field label="Subtitle" error={errors.subtitle}>
                                    <input
                                        className={inputClass(errors.subtitle)}
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                    />
                                </Field>
                                <Field label="Short description" error={errors.short_description}>
                                    <textarea
                                        rows={3}
                                        className={inputClass(errors.short_description)}
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                    />
                                </Field>
                                <Field label="Description" error={errors.description}>
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(html) => setData('description', html)}
                                        placeholder="Service description with headings, lists, links, images, and video…"
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
                                        placeholder='Leave empty for auto WebPage schema.'
                                        onChange={(e) => setData('schema_json', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </>
                    )}
                </ServiceFormTabs>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Create service'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
