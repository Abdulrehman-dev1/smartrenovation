import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type SettingsMap = Record<string, string>;

const labels: Record<string, string> = {
    site_name: 'Site name',
    site_tagline: 'Tagline',
    contact_email: 'Contact email',
    contact_phone: 'Contact phone',
    whatsapp_number: 'WhatsApp number (digits, country code)',
    contact_address: 'Contact address',
    gtm_id: 'Google Tag Manager ID',
    ga4_id: 'GA4 measurement ID',
    social_instagram: 'Instagram URL',
    social_linkedin: 'LinkedIn URL',
    seo_default_title: 'Default SEO title',
    seo_default_description: 'Default SEO description',
};

export default function Edit({ settings, can }: { settings: SettingsMap; can: { edit: boolean } }) {
    const { data, setData, put, processing, errors } = useForm({ settings });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/admin/settings', { preserveScroll: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Settings</h2>}>
            <Head title="Settings" />
            <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
                {Object.keys(labels).map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-slate-700">{labels[key]}</label>
                        <input
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                            value={data.settings[key] ?? ''}
                            disabled={!can.edit}
                            onChange={(e) =>
                                setData('settings', { ...data.settings, [key]: e.target.value })
                            }
                        />
                        {errors[`settings.${key}` as keyof typeof errors] && (
                            <p className="mt-1 text-xs text-rose-600">{String(errors[`settings.${key}` as keyof typeof errors])}</p>
                        )}
                    </div>
                ))}
                {can.edit && (
                    <button type="submit" disabled={processing} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
                        {processing ? 'Saving…' : 'Save settings'}
                    </button>
                )}
            </form>
        </AdminLayout>
    );
}
