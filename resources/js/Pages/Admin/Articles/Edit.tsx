import MediaUploader from '@/Components/MediaUploader';
import RichTextEditor from '@/Components/RichTextEditor';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type MediaItem = {
    id: number;
    name: string;
    thumb?: string | null;
    card?: string | null;
    original: string;
    collection: string;
};

type Article = {
    id: number;
    slug: string;
    title: string;
    published_on?: string | null;
    excerpt?: string | null;
    body?: string | null;
    status: string;
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    cover?: MediaItem | null;
};

const inputClass = (err?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Edit({ article, isNew = false }: { article: Article; isNew?: boolean }) {
    const { data, setData, put, processing, errors } = useForm({
        slug: article.slug ?? '',
        title: article.title === 'Untitled article' ? '' : (article.title ?? ''),
        published_on: article.published_on ?? '',
        excerpt: article.excerpt ?? '',
        body: article.body ?? '',
        status: article.status ?? 'draft',
        published_at: article.published_at ?? '',
        meta_title: article.meta_title ?? '',
        meta_description: article.meta_description ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/articles/${article.slug}`, { preserveScroll: true });
    };

    const heading = isNew ? 'New article' : 'Edit article';

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">{heading}</h2>}>
            <Head title={isNew ? 'New article' : `Edit ${article.title}`} />
            {isNew && (
                <p className="mb-4 max-w-3xl text-sm text-slate-600">
                    Fill in the details and upload a cover image below, then save.
                </p>
            )}
            <form onSubmit={submit} className="max-w-3xl space-y-4 rounded-lg border bg-white p-6">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                        className={inputClass(errors.title)}
                        value={data.title}
                        placeholder="Article title"
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Slug</label>
                    <input className={inputClass(errors.slug)} value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                    {errors.slug && <p className="mt-1 text-xs text-rose-600">{errors.slug}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Excerpt</label>
                    <textarea className={inputClass(errors.excerpt)} rows={3} value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Body</label>
                    <div className="mt-1">
                        <RichTextEditor
                            value={data.body}
                            onChange={(html) => setData('body', html)}
                            error={errors.body}
                            placeholder="Article body with headings, lists, links, images, and video…"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select className={inputClass(errors.status)} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {processing ? 'Saving…' : isNew ? 'Save article' : 'Save changes'}
                </button>
            </form>

            <div className="mt-8 max-w-4xl">
                <MediaUploader
                    modelType="article"
                    modelId={article.id}
                    collection="cover"
                    label="Cover image"
                    multiple={false}
                    existing={article.cover ? [article.cover] : []}
                />
            </div>
        </AdminLayout>
    );
}
