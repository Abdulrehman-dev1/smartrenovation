import PressFormTabs, { usePressFormTab } from '@/Components/PressFormTabs';
import PressImageUploader from '@/Components/PressImageUploader';
import PressPdfUploader from '@/Components/PressPdfUploader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, type ReactNode } from 'react';

type FileItem = { path: string; url: string; name: string };

type PressItem = {
    id: number;
    title: string;
    outlet: string;
    href?: string | null;
    status: string;
    created_at?: string | null;
    updated_at?: string | null;
    cover?: FileItem | null;
    pdf?: FileItem | null;
};

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}

const inputClass = (hasError?: string) =>
    `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
        hasError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
    }`;

function formatStamp(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function Edit({ item }: { item: PressItem }) {
    const { data, setData, put, processing, errors } = useForm({
        title: item.title ?? '',
        outlet: item.outlet ?? '',
        href: item.href ?? '',
        status: item.status ?? 'draft',
    });

    const { tab, setTab, errorFlags } = usePressFormTab(errors);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/press/${item.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit press item</h2>}>
            <Head title={`Edit ${item.title}`} />
            <form onSubmit={submit} className="w-full space-y-4">
                <PressFormTabs tab={tab} onChange={setTab} errorFlags={errorFlags}>
                    {(active) => (
                        <>
                            <div className={active === 'details' ? 'space-y-4' : 'hidden'}>
                                <Field label="Title" error={errors.title}>
                                    <input
                                        className={inputClass(errors.title)}
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                </Field>
                                <Field label="Outlet" error={errors.outlet}>
                                    <input
                                        className={inputClass(errors.outlet)}
                                        value={data.outlet}
                                        onChange={(e) => setData('outlet', e.target.value)}
                                    />
                                </Field>
                                <Field label="External URL" error={errors.href}>
                                    <input
                                        className={inputClass(errors.href)}
                                        value={data.href}
                                        placeholder="https://… (optional if PDF uploaded)"
                                        onChange={(e) => setData('href', e.target.value)}
                                    />
                                </Field>
                                <Field label="Status" error={errors.status}>
                                    <select
                                        className={inputClass(errors.status)}
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Created at</p>
                                        <p className="mt-1 text-sm text-slate-500">{formatStamp(item.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Updated at</p>
                                        <p className="mt-1 text-sm text-slate-500">{formatStamp(item.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={active === 'media' ? 'space-y-4' : 'hidden'}>
                                <PressImageUploader pressId={item.id} existing={item.cover ?? null} />
                                <PressPdfUploader pressId={item.id} existing={item.pdf ?? null} />
                                {((errors as Record<string, string | undefined>).cover ||
                                    (errors as Record<string, string | undefined>).pdf) && (
                                    <p className="text-xs font-medium text-rose-600">
                                        {(errors as Record<string, string | undefined>).cover ||
                                            (errors as Record<string, string | undefined>).pdf}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </PressFormTabs>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
