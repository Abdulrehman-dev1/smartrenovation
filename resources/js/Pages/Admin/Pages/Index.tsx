import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type PageRow = { id: number; title: string; slug: string };
type Paginated<T> = { data: T[] };

export default function Index({ pages, can }: { pages: Paginated<PageRow>; can: { create: boolean; edit: boolean; delete: boolean } }) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Pages</h2>}>
            <Head title="Pages" />
            <div className="mb-4 flex justify-end">
                {can.create && <Link href="/admin/pages/create" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New page</Link>}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Slug</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y">
                        {pages.data.map((page) => (
                            <tr key={page.id}>
                                <td className="px-4 py-3">{page.title}</td>
                                <td className="px-4 py-3 text-slate-500">{page.slug}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {can.edit && <Link href={`/admin/pages/${page.slug}/edit`} className="text-indigo-600">Edit</Link>}
                                    {can.delete && <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/pages/${page.slug}`)}>Delete</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
