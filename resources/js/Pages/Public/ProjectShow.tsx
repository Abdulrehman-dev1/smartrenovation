import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WaIcon, WA_LINK, WA_TRACK_CLASS } from '../../Components/Public/WaFloat';

type Props = {
    project: {
        slug: string;
        name: string;
        studio?: string | null;
        subtitle?: string | null;
        description?: string | null;
        description_html?: string | null;
        year?: string | number | null;
        location?: string | null;
        type?: string | null;
        cover?: string | null;
        cover_ar?: number;
        gallery: string[];
    };
    next?: {
        slug: string;
        name: string;
        location?: string | null;
        cover?: string | null;
    } | null;
    previewDraft?: boolean;
    seo?: { title?: string; description?: string };
};

export default function ProjectShow({ project, next, previewDraft, seo }: Props) {
    const titleMain = (project.name || '').split('|')[0].trim();
    const pageTitle = seo?.title || `${titleMain} — Smart Renovation`;

    return (
        <PublicLayout>
            <Head title={pageTitle}>
                {seo?.description ? <meta name="description" content={seo.description} /> : null}
            </Head>
            <main className="project">
                {previewDraft ? (
                    <div className="container" style={{ paddingTop: '1rem' }}>
                        <span className="eyebrow">Draft preview</span>
                    </div>
                ) : null}

                <Link className="back-link" href="/works">
                    ← All projects
                </Link>

                <section className="project-hero container">
                    <h1 className="project-hero__title">{titleMain}</h1>
                    <div className="project-meta">
                        {project.location && (
                            <div className="project-meta__col">
                                <span className="project-meta__label">Location</span>
                                <span>{project.location}</span>
                            </div>
                        )}
                        {project.type && (
                            <div className="project-meta__col">
                                <span className="project-meta__label">Type</span>
                                <span>{project.type}</span>
                            </div>
                        )}
                        {project.year && (
                            <div className="project-meta__col">
                                <span className="project-meta__label">Completed</span>
                                <span>{project.year}</span>
                            </div>
                        )}
                        <div className="project-meta__col">
                            <span className="project-meta__label">Studio</span>
                            <span>{project.studio || 'Smart Renovation'}</span>
                        </div>
                    </div>
                </section>

                {(project.cover || project.gallery?.length > 0) && (
                    <div className="project-photos">
                        {project.cover && (
                            <figure
                                className="project-cover"
                                style={{ aspectRatio: String(Math.max(project.cover_ar || 1.5, 0.66)) }}
                            >
                                <img src={project.cover} alt={titleMain} />
                            </figure>
                        )}
                        {project.gallery?.length > 0 && (
                            <section className="project-gallery" aria-label="Project gallery">
                                {project.gallery.map((g, i) => (
                                    <figure key={g + i}>
                                        <img src={g} alt="" loading="lazy" />
                                    </figure>
                                ))}
                            </section>
                        )}
                    </div>
                )}

                {(project.subtitle || project.description || project.description_html) && (
                    <section className="project-copy container">
                        {project.subtitle && <h2 className="project-copy__title">{project.subtitle}</h2>}
                        {project.description_html ? (
                            <div
                                className="project-copy__body"
                                dangerouslySetInnerHTML={{ __html: project.description_html }}
                            />
                        ) : project.description ? (
                            <div className="project-copy__body">
                                {project.description.split(/\n\n+/).map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        ) : null}
                    </section>
                )}

                {next && (
                    <Link className="next-project" href={`/projects/${next.slug}`}>
                        <div className="next-project__inner container">
                            <span className="next-project__label">Next project</span>
                            <h2 className="next-project__title">{(next.name || '').split('|')[0].trim()}</h2>
                            <span className="next-project__meta">{next.location}</span>
                        </div>
                        {next.cover && (
                            <div className="next-project__media">
                                <img src={next.cover} alt="" />
                            </div>
                        )}
                    </Link>
                )}

                <section className="cta-band">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Like What You See?</h2>
                        <p className="cta-band__sub">
                            Let&apos;s discuss your space — design, build and automation, held by one studio.
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
