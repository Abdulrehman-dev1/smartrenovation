import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

type Stats = {
    projects: number;
    services: number;
    articles: number;
    leads: number;
};

export default function Dashboard({ stats }: { stats: Stats }) {
    const cards = [
        { label: 'Projects', value: stats.projects, href: '/admin/projects' },
        { label: 'Services', value: stats.services, href: '/admin/services' },
        { label: 'Articles', value: stats.articles, href: '/admin/articles' },
        { label: 'Leads', value: stats.leads, href: '/admin/leads' },
    ];

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                    >
                        <div className="text-sm text-slate-500">{card.label}</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</div>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}
