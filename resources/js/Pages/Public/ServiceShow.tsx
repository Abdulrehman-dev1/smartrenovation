import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { CALL_LINK, WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type Props = {
    service: {
        slug: string;
        nav_label: string;
        hero_title: string;
        cta_label?: string | null;
        description?: string | null;
        meta_title?: string | null;
        meta_description?: string | null;
        cover?: string | null;
        gallery: string[];
    };
    seoJsonLd?: string;
};

export default function ServiceShow({ service, seoJsonLd }: Props) {
    const pageTitle = service.meta_title || `${service.nav_label} — Smart Renovation`;
    const gallery = service.gallery || [];
    const cta = service.cta_label || service.nav_label;

    return (
        <PublicLayout>
            <Head title={pageTitle}>
                {service.meta_description ? (
                    <meta name="description" content={service.meta_description} />
                ) : null}
                {seoJsonLd ? (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoJsonLd }} />
                ) : null}
            </Head>
            <main className="service">
                <Link className="back-link" href="/services">
                    ← All services
                </Link>

                <section className="service-hero">
                    <span className="service-hero__kicker">{service.nav_label}</span>
                    <h1 className="service-hero__title">{service.hero_title}</h1>
                    {service.meta_description && (
                        <p className="service-hero__lead">{service.meta_description}</p>
                    )}
                </section>

                {(service.cover || gallery.length > 0) && (
                    <div className="service-photos">
                        {service.cover && (
                            <figure className="service-cover">
                                <img src={service.cover} alt={service.nav_label} />
                            </figure>
                        )}
                        {gallery.length > 0 && (
                            <section className="service-gallery" aria-label="Service gallery">
                                {gallery.map((g, i) => (
                                    <figure key={g + i}>
                                        <img src={g} alt="" loading="lazy" />
                                    </figure>
                                ))}
                            </section>
                        )}
                    </div>
                )}

                {service.description && (
                    <article
                        className="service-body"
                        dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                )}

                <section className="cta-band">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Discuss Your {cta}.</h2>
                        <div className="cta-band__actions">
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={WA_LINK} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp Us
                            </a>
                            <a className="btn btn--solid" href={CALL_LINK}>
                                Call Us
                            </a>
                            <a className="btn btn--light" href="mailto:info@smartrenovation.ae">
                                Email
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
