import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, type ReactNode } from 'react';

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
    const { data, setData, post, processing, errors } = useForm({
        star: 5,
        review: '',
        name: '',
        location: '',
        from: 'Google',
        status: 'draft',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/reviews', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Create review</h2>}>
            <Head title="Create review" />
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
                            placeholder="Sarah M."
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Location" error={errors.location}>
                            <input
                                className={inputClass(errors.location)}
                                value={data.location}
                                placeholder="Palm Jumeirah"
                                onChange={(e) => setData('location', e.target.value)}
                            />
                        </Field>
                        <Field label="From" error={errors.from}>
                            <input
                                className={inputClass(errors.from)}
                                value={data.from}
                                placeholder="Google"
                                onChange={(e) => setData('from', e.target.value)}
                            />
                        </Field>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? 'Saving…' : 'Create review'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
