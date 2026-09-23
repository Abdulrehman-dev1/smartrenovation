import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Lead = { id: number; name: string; email: string; phone?: string | null; created_at: string };
type Paginated<T> = { data: T[] };

export default function Index({ leads, can }: { leads: Paginated<Lead>; can: { delete: boolean } }) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Leads</h2>}>
            <Head title="Leads" />
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {leads.data.map((lead) => (
                            <tr key={lead.id}>
                                <td className="px-4 py-3">{lead.name}</td>
                                <td className="px-4 py-3">{lead.email}</td>
                                <td className="px-4 py-3">{lead.phone || '—'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={`/admin/leads/${lead.id}`} className="text-indigo-600">View</Link>
                                    {can.delete && (
                                        <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/leads/${lead.id}`)}>
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
