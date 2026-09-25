import AdminIndexFilters, { STATUS_FILTER_OPTIONS } from '@/Components/AdminIndexFilters';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState, type ReactNode } from 'react';

type Service = {
    id: number;
    title: string;
    subtitle?: string | null;
    slug: string;
    status: string;
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
    services,
    filters = { search: '', status: '' },
    can,
}: {
    services: Paginated<Service>;
    filters?: { search: string; status: string };
    can: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}) {
    const [deleting, setDeleting] = useState<Service | null>(null);
    const [processing, setProcessing] = useState(false);

    const filterFields = useMemo(
        () => [
            { key: 'search', type: 'search' as const, placeholder: 'Search by title, slug…' },
            {
                key: 'status',
                type: 'select' as const,
                label: 'Status',
                options: STATUS_FILTER_OPTIONS,
            },
        ],
        [],
    );

    const hasFilters = Object.values(filters).some((v) => v.trim() !== '');

    const closeDeleteModal = () => {
        if (processing) return;
        setDeleting(null);
    };

    const confirmDelete = () => {
        if (!deleting) return;
        setProcessing(true);
        router.delete(`/admin/services/${deleting.slug}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Services</h2>}>
            <Head title="Services" />
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    {typeof services.total === 'number'
                        ? `${services.total} service${services.total === 1 ? '' : 's'}`
                        : null}
                </p>
                {can.create && (
                    <Link
                        href="/admin/services/create"
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        New service
                    </Link>
                )}
            </div>

            <AdminIndexFilters url="/admin/services" filters={filters} fields={filterFields} />

            <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[720px] table-fixed divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="w-20 px-4 py-3 text-left font-medium text-slate-600">Cover</th>
                                <th className="w-[28%] px-4 py-3 text-left font-medium text-slate-600">Title</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">Subtitle</th>
                                <th className="w-28 px-4 py-3 text-left font-medium text-slate-600">Status</th>
                                <th className="w-32 px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                        {hasFilters ? 'No services match these filters.' : 'No services yet.'}
                                    </td>
                                </tr>
                            ) : (
                                services.data.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3">
                                            <div className="h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                                                {service.cover_url ? (
                                                    <img
                                                        src={service.cover_url}
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
                                        <td className="px-4 py-3">
                                            <div className="min-w-0">
                                                {can.view ? (
                                                    <Link
                                                        href={`/admin/services/${service.slug}`}
                                                        className="block truncate font-medium text-slate-800 hover:text-indigo-600"
                                                    >
                                                        {service.title}
                                                    </Link>
                                                ) : (
                                                    <span className="block truncate font-medium text-slate-800">
                                                        {service.title}
                                                    </span>
                                                )}
                                                <p className="truncate text-xs text-slate-400">{service.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <span className="line-clamp-2">{service.subtitle || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    service.status === 'published'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {can.view && (
                                                    <IconButton
                                                        href={`/admin/services/${service.slug}`}
                                                        title="View"
                                                    >
                                                        <EyeIcon />
                                                    </IconButton>
                                                )}
                                                {can.edit && (
                                                    <IconButton
                                                        href={`/admin/services/${service.slug}/edit`}
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
                                                        onClick={() => setDeleting(service)}
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

                {(services.total ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-500">
                            {services.from && services.to && services.total
                                ? `Showing ${services.from}–${services.to} of ${services.total}`
                                : null}
                        </p>
                        {(services.last_page ?? 1) > 1 && (
                            <div className="flex flex-wrap gap-1">
                                {services.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={`s-${index}`}
                                                className="inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-xs text-slate-300"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`s-${index}`}
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
                    <h2 className="text-lg font-semibold text-slate-900">Delete service?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete{' '}
                        <span className="font-medium text-slate-800">{deleting?.title}</span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete} disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete service'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
