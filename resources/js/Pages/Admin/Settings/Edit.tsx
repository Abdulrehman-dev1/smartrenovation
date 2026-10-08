import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type SettingsMap = Record<string, string>;

const sections: { title: string; keys: { key: string; label: string; hint?: string }[] }[] = [
    {
        title: 'Site',
        keys: [
            { key: 'site_name', label: 'Site name' },
            { key: 'site_tagline', label: 'Tagline' },
        ],
    },
    {
        title: 'Contact',
        keys: [
            { key: 'contact_email', label: 'Contact email' },
            { key: 'contact_phone', label: 'Contact phone' },
            { key: 'whatsapp_number', label: 'WhatsApp number (digits, country code)' },
            { key: 'contact_address', label: 'Contact address' },
        ],
    },
    {
        title: 'Analytics & social',
        keys: [
            { key: 'gtm_id', label: 'Google Tag Manager ID' },
            { key: 'ga4_id', label: 'GA4 measurement ID' },
            { key: 'social_instagram', label: 'Instagram URL' },
            { key: 'social_linkedin', label: 'LinkedIn URL' },
        ],
    },
    {
        title: 'SEO defaults',
        keys: [
            { key: 'seo_default_title', label: 'Default SEO title' },
            { key: 'seo_default_description', label: 'Default SEO description' },
        ],
    },
    {
        title: 'Reviews section',
        keys: [
            { key: 'reviews_heading', label: 'Heading', hint: 'e.g. What Clients Say.' },
            { key: 'reviews_rating', label: 'Stars / score', hint: 'e.g. 4.8' },
            {
                key: 'reviews_google_label',
                label: 'Google text',
                hint: 'e.g. Verified Google Reviews',
            },
            {
                key: 'reviews_google_url',
                label: 'Google link',
                hint: 'Maps / reviews profile URL',
            },
        ],
    },
];

export default function Edit({ settings, can }: { settings: SettingsMap; can: { edit: boolean } }) {
    const { data, setData, put, processing, errors } = useForm({ settings });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/admin/settings', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Settings</h2>}>
            <Head title="Settings" />
            <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
                {sections.map((section) => (
                    <div
                        key={section.title}
                        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            {section.title}
                        </h3>
                        {section.keys.map(({ key, label, hint }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-slate-700">{label}</label>
                                {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
                                <input
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                                    value={data.settings[key] ?? ''}
                                    disabled={!can.edit}
                                    onChange={(e) =>
                                        setData('settings', {
                                            ...data.settings,
                                            [key]: e.target.value,
                                        })
                                    }
                                />
                                {errors[`settings.${key}` as keyof typeof errors] && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {String(errors[`settings.${key}` as keyof typeof errors])}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {can.edit && (
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save settings'}
                        </button>
                    </div>
                )}
            </form>
        </AdminLayout>
    );
}
