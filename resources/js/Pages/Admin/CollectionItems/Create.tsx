import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type ProjectOption = { id: number; name: string };

const inputClass = (err?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Create({ projects }: { projects: ProjectOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        tags: [] as string[],
        room: '',
        project_id: '' as string | number,
        sort_order: 0,
        status: 'draft',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/collection-items', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create collection item</h2>}>
            <Head title="Create collection item" />
            <form onSubmit={submit} className="max-w-3xl space-y-4 rounded-lg border bg-white p-6">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input className={inputClass(errors.title)} value={data.title} onChange={(e) => setData('title', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Room</label>
                    <input className={inputClass(errors.room)} value={data.room} onChange={(e) => setData('room', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Project</label>
                    <select className={inputClass(errors.project_id)} value={data.project_id} onChange={(e) => setData('project_id', e.target.value)}>
                        <option value="">None</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Sort order</label>
                    <input type="number" className={inputClass(errors.sort_order)} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select className={inputClass(errors.status)} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {processing ? 'Saving…' : 'Create item'}
                </button>
            </form>
        </AdminLayout>
    );
}
