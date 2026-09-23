import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type Article = {
    title: string;
    excerpt?: string | null;
    body?: string | null;
    published_on?: string | null;
    cover?: { large?: string | null; original: string } | null;
};

export default function ArticleShow({ article }: { article: Article; seoJsonLd?: string }) {
    return (
        <PublicLayout>
            <Head title={article.title} />
            <article className="max-w-3xl">
                <p className="text-sm uppercase tracking-widest text-stone-500">Article</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight">{article.title}</h1>
                {article.published_on && <p className="mt-2 text-sm text-stone-500">{article.published_on}</p>}
                {(article.cover?.large || article.cover?.original) && (
                    <img src={article.cover.large || article.cover.original} alt="" className="mt-8 w-full object-cover" />
                )}
                {article.excerpt && <p className="mt-6 text-lg text-stone-600">{article.excerpt}</p>}
                {article.body && (
                    <div
                        className="rich-content mt-8 text-stone-700"
                        dangerouslySetInnerHTML={{ __html: article.body }}
                    />
                )}
            </article>
        </PublicLayout>
    );
}
