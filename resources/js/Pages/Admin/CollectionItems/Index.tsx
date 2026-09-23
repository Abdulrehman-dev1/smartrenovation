import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Item = { id: number; title?: string | null; room?: string | null; status: string; project?: { name: string } | null };
type Paginated<T> = { data: T[] };

export default function Index({
    collectionItems,
    can,
}: {
    collectionItems: Paginated<Item>;
    can: { create: boolean; edit: boolean; delete: boolean };
}) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Collection items</h2>}>
            <Head title="Collection items" />
            <div className="mb-4 flex justify-end">
                {can.create && (
                    <Link href="/admin/collection-items/create" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                        New item
                    </Link>
                )}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Room</th>
                            <th className="px-4 py-3 text-left">Project</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {collectionItems.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">{item.title || '—'}</td>
                                <td className="px-4 py-3">{item.room || '—'}</td>
                                <td className="px-4 py-3">{item.project?.name || '—'}</td>
                                <td className="px-4 py-3">{item.status}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {can.edit && <Link href={`/admin/collection-items/${item.id}/edit`} className="text-indigo-600">Edit</Link>}
                                    {can.delete && (
                                        <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/collection-items/${item.id}`)}>
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
