import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const inputClass = (err?: string) => `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        from_path: '',
        to_path: '',
        status_code: 301,
        is_active: true,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post('/admin/redirects', { preserveScroll: true }); };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create redirect</h2>}>
            <Head title="Create redirect" />
            <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
                <div>
                    <label className="block text-sm font-medium">From path</label>
                    <input className={inputClass(errors.from_path)} value={data.from_path} onChange={(e) => setData('from_path', e.target.value)} placeholder="/old-path" />
                    {errors.from_path && <p className="mt-1 text-xs text-rose-600">{errors.from_path}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">To path</label>
                    <input className={inputClass(errors.to_path)} value={data.to_path} onChange={(e) => setData('to_path', e.target.value)} placeholder="/new-path" />
                    {errors.to_path && <p className="mt-1 text-xs text-rose-600">{errors.to_path}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Status code</label>
                    <select className={inputClass(errors.status_code)} value={data.status_code} onChange={(e) => setData('status_code', Number(e.target.value))}>
                        <option value={301}>301</option>
                        <option value={302}>302</option>
                        <option value={307}>307</option>
                        <option value={308}>308</option>
                    </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{processing ? 'Saving…' : 'Create redirect'}</button>
            </form>
        </AdminLayout>
    );
}
