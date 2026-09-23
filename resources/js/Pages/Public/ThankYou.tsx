import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

export default function ThankYou() {
    return (
        <PublicLayout title="Thank you">
            <Head title="Thank you" />
            <div className="max-w-xl space-y-4">
                <p className="text-lg text-stone-700">
                    Your message has been received. We will get back to you shortly.
                </p>
                <Link href="/" className="inline-block text-sm text-stone-900 underline">
                    Return home
                </Link>
            </div>
        </PublicLayout>
    );
}
