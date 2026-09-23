import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Award = { id: number; title: string; year?: string | null; sort_order: number };
const inputClass = (err?: string) => `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${err ? 'border-rose-500' : 'border-slate-300'}`;

export default function Edit({ award }: { award: Award }) {
    const { data, setData, put, processing, errors } = useForm({
        title: award.title ?? '',
        year: award.year ?? '',
        sort_order: award.sort_order ?? 0,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); put(`/admin/awards/${award.id}`, { preserveScroll: true }); };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit award</h2>}>
            <Head title={`Edit ${award.title}`} />
            <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input className={inputClass(errors.title)} value={data.title} onChange={(e) => setData('title', e.target.value)} />
                    {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Year</label>
                    <input className={inputClass(errors.year)} value={data.year} onChange={(e) => setData('year', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Sort order</label>
                    <input type="number" className={inputClass(errors.sort_order)} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} />
                </div>
                <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{processing ? 'Saving…' : 'Save changes'}</button>
            </form>
        </AdminLayout>
    );
}
