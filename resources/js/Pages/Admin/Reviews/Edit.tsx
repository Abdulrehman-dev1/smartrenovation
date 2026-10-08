import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, type ReactNode } from 'react';

type Review = {
    id: number;
    star: number;
    review: string;
    name: string;
    location?: string | null;
    from?: string | null;
    status: string;
    created_at?: string | null;
    updated_at?: string | null;
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

export default function Edit({ review }: { review: Review }) {
    const { data, setData, put, processing, errors } = useForm({
        star: review.star ?? 5,
        review: review.review ?? '',
        name: review.name ?? '',
        location: review.location ?? '',
        from: review.from ?? '',
        status: review.status ?? 'draft',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/reviews/${review.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Edit review</h2>}>
            <Head title={`Edit review — ${review.name}`} />
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Star" error={errors.star}>
                            <select
                                className={inputClass(errors.star)}
                                value={data.star}
                                onChange={(e) => setData('star', Number(e.target.value))}
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                        {n} ★
                                    </option>
                                ))}
                            </select>
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
                    <Field label="Review" error={errors.review}>
                        <textarea
                            rows={5}
                            className={inputClass(errors.review)}
                            value={data.review}
                            onChange={(e) => setData('review', e.target.value)}
                        />
                    </Field>
                    <Field label="Name" error={errors.name}>
                        <input
                            className={inputClass(errors.name)}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Location" error={errors.location}>
                            <input
                                className={inputClass(errors.location)}
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                            />
                        </Field>
                        <Field label="From" error={errors.from}>
                            <input
                                className={inputClass(errors.from)}
                                value={data.from}
                                onChange={(e) => setData('from', e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Created at</p>
                            <p className="mt-1 text-sm text-slate-500">{formatStamp(review.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Updated at</p>
                            <p className="mt-1 text-sm text-slate-500">{formatStamp(review.updated_at)}</p>
                        </div>
                    </div>
                </div>

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
