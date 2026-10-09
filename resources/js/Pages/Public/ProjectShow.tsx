import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import ProjectGallery from '../../Components/Public/ProjectGallery';
import { WaIcon, WA_TRACK_CLASS } from '../../Components/Public/WaFloat';
import { useSiteContact } from '@/hooks/useSiteContact';

type Props = {
    project: {
        slug: string;
        name: string;
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
    const { whatsappLink, callLink, email } = useSiteContact();
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

                <section className="project-hero">
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
                    </div>
                </section>

                <ProjectGallery
                    cover={project.cover}
                    coverAr={project.cover_ar}
                    gallery={project.gallery || []}
                    title={titleMain}
                />

                {(project.subtitle || project.description || project.description_html) && (
                    <section className="project-copy">
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
                        <div className="next-project__inner">
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
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={whatsappLink} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp
                            </a>
                            <a className="btn btn--solid" href={callLink}>
                                Call Us
                            </a>
                            <a className="btn btn--light" href={`mailto:${email}`}>
                                Email
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
