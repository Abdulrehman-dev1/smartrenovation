import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type Article = {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    published_on?: string | null;
    cover?: { card?: string | null; original: string } | null;
};

export default function Media({ articles }: { articles: Article[] }) {
    return (
        <PublicLayout title="Media">
            <Head title="Media" />
            <div className="grid gap-8 sm:grid-cols-2">
                {articles.map((article) => (
                    <Link key={article.id} href={`/media/${article.slug}`} className="block">
                        <div className="aspect-[16/10] bg-stone-200">
                            {(article.cover?.card || article.cover?.original) && (
                                <img
                                    src={article.cover.card || article.cover.original}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold">{article.title}</h2>
                        {article.excerpt && <p className="mt-1 text-sm text-stone-600">{article.excerpt}</p>}
                    </Link>
                ))}
            </div>
        </PublicLayout>
    );
}
