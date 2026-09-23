import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const inputClass = (err?: string) => `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/pages', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create page</h2>}>
            <Head title="Create page" />
            <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
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
                <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {processing ? 'Saving…' : 'Create page'}
                </button>
            </form>
        </AdminLayout>
    );
}
