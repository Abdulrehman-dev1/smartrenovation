import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type Page = { title: string; sections?: unknown[] | null } | null;

export default function Residential({ page }: { page: Page }) {
    return (
        <PublicLayout title={page?.title || 'Residential'}>
            <Head title={page?.title || 'Residential'} />
            <div className="max-w-3xl space-y-6 text-stone-700">
                <p>
                    From apartments to villas, our residential practice balances spatial clarity with tactile finishes —
                    creating homes that feel calm, considered, and personal.
                </p>
                <Link href="/contact" className="inline-block rounded-md bg-stone-900 px-5 py-2.5 text-sm text-white">
                    Start a conversation
                </Link>
            </div>
        </PublicLayout>
    );
}
