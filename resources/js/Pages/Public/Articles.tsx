import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';

/** Smart has no separate articles index — redirect to media tab. */
export default function Articles() {
    useEffect(() => {
        router.visit('/media?tab=articles', { replace: true });
    }, []);

    return (
        <PublicLayout>
            <Head title="Articles — Smart Renovation" />
            <main className="media">
                <div className="container" style={{ padding: '4rem 0' }}>
                    <p>Redirecting to media…</p>
                </div>
            </main>
        </PublicLayout>
    );
}
