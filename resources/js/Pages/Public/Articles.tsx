import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type Article = {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    published_on?: string | null;
};

export default function Articles({ articles }: { articles: Article[] }) {
    return (
        <PublicLayout title="Articles">
            <Head title="Articles" />
            <div className="space-y-6">
                {articles.map((article) => (
                    <Link key={article.id} href={`/media/${article.slug}`} className="block border-b border-stone-200 pb-6">
                        <h2 className="text-xl font-semibold">{article.title}</h2>
                        {article.excerpt && <p className="mt-2 text-stone-600">{article.excerpt}</p>}
                    </Link>
                ))}
            </div>
        </PublicLayout>
    );
}
