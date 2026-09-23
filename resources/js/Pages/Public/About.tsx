import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type Award = { id: number; title: string; year?: string | null };
type Page = { title: string; sections?: unknown[] | null } | null;

export default function About({ page, awards }: { page: Page; awards: Award[] }) {
    return (
        <PublicLayout title={page?.title || 'About'}>
            <Head title={page?.title || 'About'} />
            <div className="max-w-3xl space-y-6 text-stone-700">
                <p>
                    Smart Renovation is a design-led renovation studio focused on clarity of plan, refined material
                    palettes, and enduring craftsmanship across residential and commercial projects.
                </p>
                {awards.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold text-stone-900">Awards</h2>
                        <ul className="mt-4 space-y-2">
                            {awards.map((award) => (
                                <li key={award.id}>
                                    {award.title}
                                    {award.year ? ` — ${award.year}` : ''}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </PublicLayout>
    );
}
