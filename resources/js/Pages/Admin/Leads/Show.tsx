import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

type Lead = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    message: string;
    source?: string | null;
    created_at: string;
};

export default function Show({ lead, can }: { lead: Lead; can: { delete: boolean } }) {
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Lead</h2>}>
            <Head title={`Lead: ${lead.name}`} />
            <div className="max-w-2xl space-y-4 rounded-lg border bg-white p-6 text-sm">
                <div><span className="font-medium text-slate-500">Name</span><div>{lead.name}</div></div>
                <div><span className="font-medium text-slate-500">Email</span><div>{lead.email}</div></div>
                <div><span className="font-medium text-slate-500">Phone</span><div>{lead.phone || '—'}</div></div>
                <div><span className="font-medium text-slate-500">Source</span><div>{lead.source || '—'}</div></div>
                <div><span className="font-medium text-slate-500">Message</span><div className="whitespace-pre-wrap">{lead.message}</div></div>
                <div className="flex gap-3 pt-4">
                    <Link href="/admin/leads" className="text-indigo-600">Back</Link>
                    {can.delete && (
                        <button type="button" className="text-rose-600" onClick={() => confirm('Delete?') && router.delete(`/admin/leads/${lead.id}`)}>
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
