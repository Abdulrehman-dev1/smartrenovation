import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type ContactInfo = {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
};

export default function Contact({ contact }: { contact: ContactInfo }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        source: 'contact',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/contact', { preserveScroll: true });
    };

    return (
        <PublicLayout title="Contact">
            <Head title="Contact" />
            <div className="grid gap-10 lg:grid-cols-2">
                <div className="space-y-3 text-stone-600">
                    {contact.email && <p>{contact.email}</p>}
                    {contact.phone && <p>{contact.phone}</p>}
                    {contact.address && <p>{contact.address}</p>}
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.name ? 'border-rose-500' : 'border-stone-300'}`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.email ? 'border-rose-500' : 'border-stone-300'}`}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.phone ? 'border-rose-500' : 'border-stone-300'}`}
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Message</label>
                        <textarea
                            rows={5}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.message ? 'border-rose-500' : 'border-stone-300'}`}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                        />
                        {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-stone-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
                    >
                        {processing ? 'Sending…' : 'Send message'}
                    </button>
                </form>
            </div>
        </PublicLayout>
    );
}
