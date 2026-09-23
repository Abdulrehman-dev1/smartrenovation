import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Article = { id: number; title: string; slug: string; status: string };
type Paginated<T> = { data: T[] };

export default function Index({
    articles,
    can,
}: {
    articles: Paginated<Article>;
    can: { create: boolean; edit: boolean; delete: boolean };
}) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Articles</h2>}>
            <Head title="Articles" />
            <div className="mb-4 flex justify-end">
                {can.create && (
                    <Link href="/admin/articles/create" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
                        New article
                    </Link>
                )}
            </div>
            <div className="overflow-hidden rounded-lg border bg-white">
                <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Slug</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {articles.data.map((article) => (
                            <tr key={article.id}>
                                <td className="px-4 py-3">{article.title}</td>
                                <td className="px-4 py-3 text-slate-500">{article.slug}</td>
                                <td className="px-4 py-3">{article.status}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {can.edit && <Link href={`/admin/articles/${article.slug}/edit`} className="text-indigo-600">Edit</Link>}
                                    {can.delete && (
                                        <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/articles/${article.slug}`)}>
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
