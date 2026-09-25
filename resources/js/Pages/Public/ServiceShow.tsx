import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { CALL_LINK, WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type Props = {
    service: {
        slug: string;
        title: string;
        subtitle?: string | null;
        short_description?: string | null;
        description?: string | null;
        meta_description?: string | null;
        cover?: { url?: string | null } | null;
        gallery: Array<{ url: string }>;
    };
};

export default function ServiceShow({ service }: Props) {
    const cover = service.cover?.url;
    const gallery = (service.gallery || []).map((g) => g.url).filter(Boolean);
    const lead = service.meta_description || service.short_description;
    const body = service.description || '';

    return (
        <PublicLayout>
            <Head title={`${service.title} — Smart Renovation`} />
            <main className="service">
                <Link className="back-link" href="/services">
                    ← All services
                </Link>

                <section className="service-hero container">
                    <span className="service-hero__kicker">{service.title}</span>
                    <h1 className="service-hero__title">{service.subtitle || service.title}</h1>
                    {lead && <p className="service-hero__lead">{lead}</p>}
                </section>

                {(cover || gallery.length > 0) && (
                    <div className="service-photos">
                        {cover && (
                            <figure className="service-cover">
                                <img src={cover} alt={service.title} />
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

                {body && (
                    <article
                        className="service-body container"
                        dangerouslySetInnerHTML={{
                            __html: body.includes('<')
                                ? body
                                : body
                                      .split(/\n\n+/)
                                      .map((p) => `<p class="service-body__p">${p}</p>`)
                                      .join(''),
                        }}
                    />
                )}

                <section className="cta-band">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Discuss Your {service.title}.</h2>
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
