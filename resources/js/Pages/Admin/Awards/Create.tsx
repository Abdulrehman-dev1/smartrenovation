import PendingImagePicker, { PendingImage, pendingToFiles } from '@/Components/PendingImagePicker';
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

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        organization: '',
        year: '',
        status: 'draft',
        cover: null as File | null,
    });

    const syncCover = (next: PendingImage[]) => {
        setCoverPending(next);
        setData('cover', pendingToFiles(next, false) as File | null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/awards', { forceFormData: true, preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create award</h2>}>
            <Head title="Create award" />
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <Field label="Title" error={errors.title}>
                        <input
                            className={inputClass(errors.title)}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                    </Field>
                    <Field label="Organization" error={errors.organization}>
                        <input
                            className={inputClass(errors.organization)}
                            value={data.organization}
                            placeholder="e.g. Architecture Leaders Awards"
                            onChange={(e) => setData('organization', e.target.value)}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Year" error={errors.year}>
                            <input
                                className={inputClass(errors.year)}
                                value={data.year}
                                placeholder="2026"
                                onChange={(e) => setData('year', e.target.value)}
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
                    <PendingImagePicker
                        label="Cover image"
                        multiple={false}
                        value={coverPending}
                        onChange={syncCover}
                        error={errors.cover}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Create award'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
