import RichTextEditor from '@/Components/RichTextEditor';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const inputClass = (err?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
        published_on: '',
        excerpt: '',
        body: '',
        status: 'draft',
        published_at: '',
        meta_title: '',
        meta_description: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/articles', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create article</h2>}>
            <Head title="Create article" />
            <form onSubmit={submit} className="max-w-3xl space-y-4 rounded-lg border bg-white p-6">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input className={inputClass(errors.title)} value={data.title} onChange={(e) => setData('title', e.target.value)} />
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
                    {processing ? 'Saving…' : 'Create article'}
                </button>
            </form>
        </AdminLayout>
    );
}
