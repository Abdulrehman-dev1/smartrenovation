import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Award = { id: number; title: string; year?: string | null; sort_order: number };
type Paginated<T> = { data: T[] };

export default function Index({ awards, can }: { awards: Paginated<Award>; can: { create: boolean; edit: boolean; delete: boolean } }) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Awards</h2>}>
            <Head title="Awards" />
            <div className="mb-4 flex justify-end">
                {can.create && <Link href="/admin/awards/create" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New award</Link>}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Year</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y">
                        {awards.data.map((award) => (
                            <tr key={award.id}>
                                <td className="px-4 py-3">{award.title}</td>
                                <td className="px-4 py-3">{award.year || '—'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {can.edit && <Link href={`/admin/awards/${award.id}/edit`} className="text-indigo-600">Edit</Link>}
                                    {can.delete && <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/awards/${award.id}`)}>Delete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
