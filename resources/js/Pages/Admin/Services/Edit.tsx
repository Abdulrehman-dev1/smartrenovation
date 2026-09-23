import RichTextEditor from '@/Components/RichTextEditor';
import ServiceFormTabs, { useServiceFormTab } from '@/Components/ServiceFormTabs';
import ServiceImageUploader from '@/Components/ServiceImageUploader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, type ReactNode } from 'react';

type ImageItem = {
    path: string;
    url: string;
    name: string;
};

type Service = {
    id: number;
    slug: string;
    title: string;
    subtitle?: string | null;
    short_description?: string | null;
    description?: string | null;
    status: string;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
    schema_json?: string | null;
    cover?: ImageItem | null;
    gallery?: ImageItem[];
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

export default function Edit({ service }: { service: Service }) {
    const { data, setData, put, processing, errors } = useForm({
        slug: service.slug ?? '',
        title: service.title ?? '',
        subtitle: service.subtitle ?? '',
        short_description: service.short_description ?? '',
        description: service.description ?? '',
        status: service.status ?? 'draft',
        published_at: service.published_at ?? '',
        meta_title: service.meta_title ?? '',
        meta_description: service.meta_description ?? '',
        canonical_url: service.canonical_url ?? '',
        schema_json: service.schema_json ?? '',
    });

    const { tab, setTab, errorFlags } = useServiceFormTab(errors);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/services/${service.slug}`, { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit service</h2>}>
            <Head title={`Edit ${service.title}`} />
            <form onSubmit={submit} className="w-full space-y-4">
                <ServiceFormTabs tab={tab} onChange={setTab} errorFlags={errorFlags}>
                    {(active) => (
                        <>
                            <div className={active === 'details' ? 'space-y-4' : 'hidden'}>
                                <Field label="Title" error={errors.title}>
                                    <input
                                        className={inputClass(errors.title)}
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                </Field>
                                <Field label="Slug" error={errors.slug}>
                                    <input
                                        className={inputClass(errors.slug)}
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
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
                                <ServiceImageUploader
                                    serviceSlug={service.slug}
                                    collection="cover"
                                    label="Cover image"
                                    multiple={false}
                                    existing={service.cover ? [service.cover] : []}
                                />
                                <ServiceImageUploader
                                    serviceSlug={service.slug}
                                    collection="gallery"
                                    label="Gallery images"
                                    existing={service.gallery ?? []}
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
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
