import PendingImagePicker, { PendingImage, pendingToFiles } from '@/Components/PendingImagePicker';
import PressFormTabs, { usePressFormTab } from '@/Components/PressFormTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState, type ReactNode } from 'react';

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

export default function Create() {
    const [coverPending, setCoverPending] = useState<PendingImage[]>([]);
    const [pdfName, setPdfName] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        outlet: '',
        href: '',
        status: 'draft',
        cover: null as File | null,
        pdf: null as File | null,
    });

    const { tab, setTab, errorFlags } = usePressFormTab(errors);

    const syncCover = (next: PendingImage[]) => {
        setCoverPending(next);
        setData('cover', pendingToFiles(next, false) as File | null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/press', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create press item</h2>}>
            <Head title="Create press item" />
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
                                        placeholder="e.g. BetterLiving"
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
                            </div>

                            <div className={active === 'media' ? 'space-y-4' : 'hidden'}>
                                <PendingImagePicker
                                    label="Cover image"
                                    multiple={false}
                                    value={coverPending}
                                    onChange={syncCover}
                                    error={errors.cover}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">PDF file</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="mt-1 block w-full text-sm text-slate-600"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setData('pdf', file);
                                            setPdfName(file?.name ?? '');
                                        }}
                                    />
                                    {pdfName && <p className="mt-1 text-xs text-slate-500">{pdfName}</p>}
                                    {errors.pdf && (
                                        <p className="mt-1 text-xs font-medium text-rose-600">{errors.pdf}</p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">
                                        Optional. Prefer this over the external URL on the public site when set.
                                    </p>
                                </div>
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
                        {processing ? 'Saving…' : 'Create press item'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
