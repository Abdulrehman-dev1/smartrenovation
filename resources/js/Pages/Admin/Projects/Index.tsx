import AdminIndexFilters, { STATUS_FILTER_OPTIONS } from '@/Components/AdminIndexFilters';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState, type ReactNode } from 'react';

type Project = {
    id: number;
    name: string;
    subtitle?: string | null;
    slug: string;
    status: string;
    sort_order?: number | null;
    location?: string | null;
    category?: string | null;
    cover_url?: string | null;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    from?: number | null;
    to?: number | null;
    total?: number;
    last_page?: number;
};

function IconButton({
    href,
    onClick,
    title,
    tone = 'slate',
    children,
}: {
    href?: string;
    onClick?: () => void;
    title: string;
    tone?: 'slate' | 'indigo' | 'rose';
    children: ReactNode;
}) {
    const tones = {
        slate: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        indigo: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
        rose: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    };
    const className = `inline-flex h-8 w-8 items-center justify-center rounded-md ${tones[tone]}`;

    if (href) {
        return (
            <Link href={href} title={title} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" title={title} onClick={onClick} className={className}>
            {children}
        </button>
    );
}

function EyeIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 113.0 3L7.5 18.85 3 20.25l1.4-4.5 12.462-12.263z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5h6v2m-8 0l1 12h8l1-12" />
        </svg>
    );
}

export default function Index({
    projects,
    filters = { search: '', category: '', location: '', status: '' },
    filterOptions = { categories: [], locations: [] },
    can,
}: {
    projects: Paginated<Project>;
    filters?: { search: string; category: string; location: string; status: string };
    filterOptions?: {
        categories: { value: string; label: string }[];
        locations: { value: string; label: string }[];
    };
    can: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}) {
    const [deleting, setDeleting] = useState<Project | null>(null);
    const [processing, setProcessing] = useState(false);

    const filterFields = useMemo(
        () => [
            { key: 'search', type: 'search' as const, placeholder: 'Search by title, slug…' },
            {
                key: 'category',
                type: 'select' as const,
                label: 'Category',
                options: filterOptions.categories,
            },
            {
                key: 'location',
                type: 'select' as const,
                label: 'Location',
                options: filterOptions.locations,
            },
            {
                key: 'status',
                type: 'select' as const,
                label: 'Status',
                options: STATUS_FILTER_OPTIONS,
            },
        ],
        [filterOptions.categories, filterOptions.locations],
    );

    const hasFilters = Object.values(filters).some((v) => v.trim() !== '');

    const closeDeleteModal = () => {
        if (processing) {
            return;
        }
        setDeleting(null);
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        setProcessing(true);
        router.delete(`/admin/projects/${deleting.slug}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Projects</h2>}>
            <Head title="Projects" />
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    {typeof projects.total === 'number'
                        ? `${projects.total} project${projects.total === 1 ? '' : 's'}`
                        : null}
                </p>
                {can.create && (
                    <Link
                        href="/admin/projects/create"
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        New project
                    </Link>
                )}
            </div>

            <AdminIndexFilters url="/admin/projects" filters={filters} fields={filterFields} />

            <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[860px] table-fixed divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="w-20 px-4 py-3 text-left font-medium text-slate-600">Cover</th>
                                <th className="w-16 px-4 py-3 text-left font-medium text-slate-600">#</th>
                                <th className="w-[22%] px-4 py-3 text-left font-medium text-slate-600">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Subtitle</th>
                                <th className="w-36 px-4 py-3 text-left font-medium text-slate-600">Category</th>
                                <th className="w-36 px-4 py-3 text-left font-medium text-slate-600">Location</th>
                                <th className="w-28 px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="w-32 px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {projects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                                        {hasFilters ? 'No projects match these filters.' : 'No projects yet.'}
                                    </td>
                                </tr>
                            ) : (
                                projects.data.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3">
                                            <div className="h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                                                {project.cover_url ? (
                                                    <img
                                                        src={project.cover_url}
                                                        alt=""
                                                        className="h-12 w-12 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                                        N/A
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                            {project.sort_order ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="min-w-0">
                                                {can.view ? (
                                                    <Link
                                                        href={`/admin/projects/${project.slug}`}
                                                        className="block truncate font-medium text-slate-800 hover:text-indigo-600"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="block truncate font-medium text-slate-800">
                                                        {project.name}
                                                    </span>
                                                )}
                                                <p className="truncate text-xs text-slate-400">{project.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <span className="line-clamp-2">{project.subtitle || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{project.category || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{project.location || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    project.status === 'published'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {can.view && (
                                                    <IconButton
                                                        href={`/admin/projects/${project.slug}`}
                                                        title="View"
                                                        tone="slate"
                                                    >
                                                        <EyeIcon />
                                                    </IconButton>
                                                )}
                                                {can.edit && (
                                                    <IconButton
                                                        href={`/admin/projects/${project.slug}/edit`}
                                                        title="Edit"
                                                        tone="indigo"
                                                    >
                                                        <PencilIcon />
                                                    </IconButton>
                                                )}
                                                {can.delete && (
                                                    <IconButton
                                                        title="Delete"
                                                        tone="rose"
                                                        onClick={() => setDeleting(project)}
                                                    >
                                                        <TrashIcon />
                                                    </IconButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {(projects.total ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-500">
                            {projects.from && projects.to && projects.total
                                ? `Showing ${projects.from}–${projects.to} of ${projects.total}`
                                : null}
                        </p>
                        {(projects.last_page ?? 1) > 1 && (
                            <div className="flex flex-wrap gap-1">
                                {projects.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={`p-${index}`}
                                                className="inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs text-slate-300"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`p-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs ${
                                                link.active
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={deleting !== null} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Delete project?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete{' '}
                        <span className="font-medium text-slate-800">{deleting?.name}</span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete project'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
