import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { CALL_LINK, WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type ServiceCard = {
    id: number;
    slug: string;
    nav_label: string;
    meta_description?: string | null;
    cover_url?: string | null;
    url: string;
};

type Props = {
    services: ServiceCard[];
};

export default function Services({ services }: Props) {
    return (
        <PublicLayout>
            <Head title="Services — Smart Renovation" />
            <main className="services-index">
                <section className="works-intro container">
                    <span className="eyebrow reveal in">What We Do</span>
                    <h1 className="works-intro__title reveal in" data-delay="1">
                        Our <em>Services</em>.
                    </h1>
                    <p className="works-intro__lead reveal in" data-delay="2">
                        One studio for design and build — to deliver your turnkey renovation.
                    </p>
                </section>

                <section className="svc-grid container">
                    {services.map((s, i) => (
                        <Link key={s.slug} className="svc-card reveal in" href={s.url}>
                            <div className="svc-card__media reveal-img in">
                                {s.cover_url ? <img src={s.cover_url} alt="" loading="lazy" /> : null}
                            </div>
                            <div className="svc-card__info">
                                <span className="svc-card__no">{String(i + 1).padStart(2, '0')}</span>
                                <h2 className="svc-card__title">{s.nav_label}</h2>
                                <p className="svc-card__sub">{s.meta_description}</p>
                                <span className="svc-card__link">Explore →</span>
                            </div>
                        </Link>
                    ))}
                </section>

                <section className="cta-band">
                    <div className="container">
                        <span className="eyebrow reveal">Let&apos;s talk</span>
                        <h2 className="cta-band__title reveal" data-delay="1">
                            Start Your Project.
                        </h2>
                        <div className="cta-band__actions reveal" data-delay="2">
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
