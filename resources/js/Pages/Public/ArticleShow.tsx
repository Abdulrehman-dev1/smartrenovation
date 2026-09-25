import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type Props = {
    article: {
        slug: string;
        title: string;
        subtitle?: string | null;
        description?: string | null;
        published_at?: string | null;
        cover_url?: string | null;
        meta_title?: string | null;
        meta_description?: string | null;
    };
    next?: {
        slug: string;
        title: string;
        cover_url?: string | null;
    } | null;
    seoJsonLd?: string;
};

function formatDate(iso?: string | null) {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return null;
    }
}

export default function ArticleShow({ article, next, seoJsonLd }: Props) {
    const date = formatDate(article.published_at);
    const title = article.meta_title || `${article.title} — Smart Renovation`;

    return (
        <PublicLayout>
            <Head title={title}>
                {article.meta_description ? (
                    <meta name="description" content={article.meta_description} />
                ) : null}
                {seoJsonLd ? (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoJsonLd }} />
                ) : null}
            </Head>
            <main className="article">
                <div className="container article__head">
                    <Link className="back-link" href="/media">
                        ← Media Coverage
                    </Link>
                    {date && <span className="article__date">{date}</span>}
                    <h1 className="article__title">{article.title}</h1>
                    {article.subtitle && <p className="article__excerpt">{article.subtitle}</p>}
                </div>

                {article.cover_url && (
                    <figure className="article__cover">
                        <img src={article.cover_url} alt={article.title} />
                    </figure>
                )}

                {article.description && (
                    <article
                        className="article-body container"
                        dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                )}

                {next && (
                    <Link className="next-project" href={`/articles/${next.slug}`}>
                        <div className="next-project__inner container">
                            <span className="next-project__label">Next article</span>
                            <h2 className="next-project__title">{next.title}</h2>
                        </div>
                        {next.cover_url && (
                            <div className="next-project__media">
                                <img src={next.cover_url} alt="" />
                            </div>
                        )}
                    </Link>
                )}

                <section className="cta-band">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Start Your Project.</h2>
                        <p className="cta-band__sub">
                            Tell us about your space and timeline — we reply fast with a clear plan.
                        </p>
                        <div className="cta-band__actions">
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={WA_LINK} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp Us
                            </a>
                            <a className="btn btn--solid" href="mailto:info@smartrenovation.ae">
                                Email The Studio
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
