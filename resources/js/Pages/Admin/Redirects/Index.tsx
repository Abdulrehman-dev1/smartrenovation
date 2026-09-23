import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type RedirectRow = { id: number; from_path: string; to_path: string; status_code: number; is_active: boolean };
type Paginated<T> = { data: T[] };

export default function Index({ redirects, can }: { redirects: Paginated<RedirectRow>; can: { create: boolean; edit: boolean; delete: boolean } }) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Redirects</h2>}>
            <Head title="Redirects" />
            <div className="mb-4 flex justify-end">
                {can.create && <Link href="/admin/redirects/create" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New redirect</Link>}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">From</th>
                            <th className="px-4 py-3 text-left">To</th>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Active</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {redirects.data.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3">{row.from_path}</td>
                                <td className="px-4 py-3">{row.to_path}</td>
                                <td className="px-4 py-3">{row.status_code}</td>
                                <td className="px-4 py-3">{row.is_active ? 'Yes' : 'No'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {can.edit && <Link href={`/admin/redirects/${row.id}/edit`} className="text-indigo-600">Edit</Link>}
                                    {can.delete && <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/redirects/${row.id}`)}>Delete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
