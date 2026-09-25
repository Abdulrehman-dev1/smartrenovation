import ContactForm from '@/Components/Public/ContactForm';
import HeroVideo from '@/Components/Public/HeroVideo';
import ReviewsSection from '@/Components/Public/ReviewsSection';
import Slider from '@/Components/Public/Slider';
import {
    CALL_DISPLAY,
    CALL_LINK,
    WA_LINK,
    WA_TRACK_CLASS,
    WaIcon,
} from '@/Components/Public/WaFloat';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

type FeaturedProject = {
    slug: string;
    name: string;
    img?: string | null;
    meta?: string;
};

type AwardSlide = {
    img?: string | null;
    year?: string | null;
    title: string;
    org?: string | null;
};

const PROCESS = [
    {
        no: '01',
        name: 'Discovery Stage',
        desc: 'We visit and survey the space — measurements, structure, light and access — then sit with you to understand how you live and what you want to change.',
    },
    {
        no: '02',
        name: 'Planning Stage',
        desc: 'A tailored proposal with scope, materials, cost and timeline — followed by technical drawings, floor plans, mood boards and any permits.',
    },
    {
        no: '03',
        name: 'Delivery Stage',
        desc: 'One team runs the build end to end, from demolition to finishes, monitored daily — then deep-cleaned, quality-checked and handed over.',
    },
];

export default function Home({
    featuredProjects = [],
    awards = [],
    seoJsonLd,
}: {
    featuredProjects?: FeaturedProject[];
    awards?: AwardSlide[];
    seoJsonLd?: string;
}) {
    return (
        <PublicLayout>
            <Head title="Smart Renovation — Design & Build Studio in Dubai">
                <meta
                    head-key="description"
                    name="description"
                    content="Italian craftsmanship in Dubai — turnkey renovation and fit-out, held by one studio from design to handover."
                />
                {seoJsonLd ? (
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoJsonLd }} />
                ) : null}
            </Head>

            <main>
                <section className="hero hero--stacked">
                    <div className="hero__media reveal-img in">
                        <HeroVideo />
                    </div>
                    <div className="hero__content container">
                        <span className="hero__eyebrow reveal in" data-delay="1">
                            Italian Craftsmanship · Dubai
                        </span>
                        <h1 className="hero__title reveal in" data-delay="2">
                            Reinventing Properties
                            <br />
                            Since 1970.
                        </h1>
                        <div className="hero__cta reveal in" data-delay="3">
                            <a
                                className={`btn btn--wa ${WA_TRACK_CLASS}`}
                                href={WA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WaIcon /> WhatsApp Us
                            </a>
                            <a className="btn btn--outline" href="#contact">
                                Discuss Your Vision
                            </a>
                        </div>
                    </div>
                </section>

                <section className="portfolio container" id="portfolio">
                    <div className="portfolio__head">
                        <h2 className="reveal">
                            Selected <em>Work</em>
                        </h2>
                        <Link className="portfolio__head-link reveal" data-delay="1" href="/works">
                            All projects →
                        </Link>
                    </div>

                    <div className="portfolio__grid">
                        {featuredProjects.map((c, i) => (
                            <Link
                                key={c.slug}
                                className="card reveal"
                                data-delay={i % 3 || undefined}
                                href={`/projects/${c.slug}`}
                            >
                                <div className="card__media reveal-img">
                                    {c.img ? <img src={c.img} alt="" /> : null}
                                </div>
                                <div className="card__row">
                                    <span className="card__name">{c.name}</span>
                                    <span className="card__meta">{c.meta || ''}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="portfolio__cta reveal">
                        <Link className="btn btn--outline" href="/works">
                            View All Projects
                        </Link>
                    </div>
                </section>

                <section className="styles" id="process">
                    <div className="container">
                        <div className="styles__head">
                            <span className="eyebrow reveal">Process</span>
                            <h2 className="reveal" data-delay="1">
                                The Smart Renovation <em>Process</em>
                            </h2>
                        </div>
                        <ul className="process__list">
                            {PROCESS.map((s) => (
                                <li key={s.no} className="reveal">
                                    <span className="process__no">{s.no}</span>
                                    <span className="process__name">{s.name}</span>
                                    <span className="process__desc">{s.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="feature">
                    <div className="feature__media reveal-img">
                        <img src="/assets/img/site/feature.jpg" alt="" />
                    </div>
                    <div className="feature__overlay container">
                        <span className="eyebrow reveal">Crafted in the Italian tradition</span>
                        <h2 className="reveal" data-delay="1">
                            Elegance, engineered.
                        </h2>
                        <a className="btn btn--light reveal" data-delay="2" href="#contact">
                            Start The Conversation
                        </a>
                    </div>
                </section>

                {awards.length > 0 && (
                    <section className="awards" id="press">
                        <div className="container awards__head">
                            <span className="eyebrow reveal">Recognitions</span>
                            <h2 className="reveal" data-delay="1">
                                Recognitions &amp; Awards.
                            </h2>
                        </div>

                        <Slider className="reveal">
                            {awards.map((a, i) => (
                                <article className="slide" key={`${a.title}-${i}`}>
                                    <div className="slide__media">
                                        {a.img ? (
                                            <img
                                                src={a.img}
                                                alt={`${a.org ?? ''} ${a.year ?? ''}`}
                                                loading="lazy"
                                            />
                                        ) : null}
                                        <span className="slide__scrim"></span>
                                    </div>
                                    <div className="slide__cap">
                                        {a.year ? <span className="slide__year">{a.year}</span> : null}
                                        <h3>{a.title}</h3>
                                        {a.org ? <span className="slide__org">{a.org}</span> : null}
                                    </div>
                                </article>
                            ))}
                        </Slider>
                    </section>
                )}

                <ReviewsSection />

                <section className="cta-band cta-band--contact" id="contact">
                    <div className="container cta-band__grid">
                        <div className="cta-band__intro">
                            <span className="eyebrow reveal">Let&apos;s talk</span>
                            <h2 className="cta-band__title reveal" data-delay="1">
                                Discuss Your Project.
                            </h2>
                            <p className="cta-band__sub reveal" data-delay="2">
                                Tell us about your space, ambition and timeline. We answer fast — with a
                                clear plan and budget.
                            </p>
                            <div className="cta-band__actions reveal" data-delay="3">
                                <a
                                    className={`btn btn--wa ${WA_TRACK_CLASS}`}
                                    href={WA_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <WaIcon /> WhatsApp Us
                                </a>
                                <a className="btn btn--solid" href={CALL_LINK}>
                                    Call Us
                                </a>
                                <a className="btn btn--light" href="mailto:info@smartrenovation.ae">
                                    Email
                                </a>
                            </div>
                            <div className="cta-band__meta reveal" data-delay="4">
                                <span>Sheikh Zayed Road, Dubai, UAE</span>
                                <span>{CALL_DISPLAY}</span>
                                <span>info@smartrenovation.ae</span>
                            </div>
                        </div>
                        <ContactForm source="home" />
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
