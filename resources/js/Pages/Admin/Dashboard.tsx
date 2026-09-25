import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

type Stats = {
    projects: number;
    projects_published: number;
    projects_draft: number;
    services: number;
    services_published: number;
    articles: number;
    articles_published: number;
    press: number;
    awards: number;
    leads: number;
    leads_week: number;
};

type RecentProject = {
    id: number;
    name: string;
    slug: string;
    status: string;
    category?: string | null;
    location?: string | null;
    cover_url?: string | null;
    updated_at?: string | null;
};

type RecentLead = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    created_at?: string | null;
};

type RecentArticle = {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at?: string | null;
};

function formatWhen(value?: string | null) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                status === 'published'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
            }`}
        >
            {status}
        </span>
    );
}

export default function Dashboard({
    stats,
    recentProjects = [],
    recentLeads = [],
    recentArticles = [],
}: {
    stats: Stats;
    recentProjects?: RecentProject[];
    recentLeads?: RecentLead[];
    recentArticles?: RecentArticle[];
}) {
    const user = usePage().props.auth.user;
    const firstName = (user?.name ?? 'Admin').split(' ')[0];

    const summary = [
        {
            label: 'Projects',
            value: stats.projects,
            href: '/admin/projects',
            meta: `${stats.projects_published} published · ${stats.projects_draft} draft`,
        },
        {
            label: 'Services',
            value: stats.services,
            href: '/admin/services',
            meta: `${stats.services_published} published`,
        },
        {
            label: 'Articles',
            value: stats.articles,
            href: '/admin/articles',
            meta: `${stats.articles_published} published`,
        },
        {
            label: 'Press',
            value: stats.press,
            href: '/admin/press',
            meta: 'Media coverage',
        },
        {
            label: 'Awards',
            value: stats.awards,
            href: '/admin/awards',
            meta: 'Recognitions',
        },
        {
            label: 'Leads',
            value: stats.leads,
            href: '/admin/leads',
            meta: `${stats.leads_week} this week`,
        },
    ];

    const shortcuts = [
        { label: 'New project', href: '/admin/projects/create' },
        { label: 'New article', href: '/admin/articles/create' },
        { label: 'New service', href: '/admin/services/create' },
        { label: 'View leads', href: '/admin/leads' },
        { label: 'Site settings', href: '/admin/settings' },
        { label: 'View website', href: '/', external: true },
    ];

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-5 py-6 text-white sm:px-7 sm:py-8">
                    <p className="text-sm text-slate-300">Welcome back</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{firstName}</h1>
                    <p className="mt-2 max-w-xl text-sm text-slate-300">
                        Overview of CMS content — projects, media, and incoming leads.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {shortcuts.slice(0, 4).map((item) =>
                            item.external ? (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {summary.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                    <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                                        {card.value}
                                    </p>
                                </div>
                                <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
                                    Open
                                </span>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">{card.meta}</p>
                        </Link>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-5">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-3">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <h3 className="text-sm font-semibold text-slate-800">Recent projects</h3>
                            <Link href="/admin/projects" className="text-xs font-medium text-indigo-600 hover:underline">
                                View all
                            </Link>
                        </div>
                        {recentProjects.length === 0 ? (
                            <p className="px-4 py-8 text-sm text-slate-500">No projects yet.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentProjects.map((project) => (
                                    <li key={project.id}>
                                        <Link
                                            href={`/admin/projects/${project.slug}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80"
                                        >
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                                                {project.cover_url ? (
                                                    <img
                                                        src={project.cover_url}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                                                        N/A
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {project.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {[project.category, project.location].filter(Boolean).join(' · ') ||
                                                        project.slug}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <StatusPill status={project.status} />
                                                <span className="text-[11px] text-slate-400">
                                                    {formatWhen(project.updated_at)}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-6 xl:col-span-2">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h3 className="text-sm font-semibold text-slate-800">Recent leads</h3>
                                <Link href="/admin/leads" className="text-xs font-medium text-indigo-600 hover:underline">
                                    View all
                                </Link>
                            </div>
                            {recentLeads.length === 0 ? (
                                <p className="px-4 py-8 text-sm text-slate-500">No leads yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {recentLeads.map((lead) => (
                                        <li key={lead.id}>
                                            <Link
                                                href={`/admin/leads/${lead.id}`}
                                                className="block px-4 py-3 hover:bg-slate-50/80"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate text-sm font-medium text-slate-800">
                                                        {lead.name}
                                                    </p>
                                                    <span className="shrink-0 text-[11px] text-slate-400">
                                                        {formatWhen(lead.created_at)}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">{lead.email}</p>
                                                {lead.phone && (
                                                    <p className="truncate text-xs text-slate-400">{lead.phone}</p>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h3 className="text-sm font-semibold text-slate-800">Recent articles</h3>
                                <Link
                                    href="/admin/articles"
                                    className="text-xs font-medium text-indigo-600 hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                            {recentArticles.length === 0 ? (
                                <p className="px-4 py-8 text-sm text-slate-500">No articles yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {recentArticles.map((article) => (
                                        <li key={article.id}>
                                            <Link
                                                href={`/admin/articles/${article.slug}`}
                                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-800">
                                                        {article.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {formatWhen(article.updated_at)}
                                                    </p>
                                                </div>
                                                <StatusPill status={article.status} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Quick actions</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {shortcuts.map((item) =>
                            item.external ? (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
