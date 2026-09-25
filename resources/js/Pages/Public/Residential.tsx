import ContactForm from '@/Components/Public/ContactForm';
import ReviewsSection from '@/Components/Public/ReviewsSection';
import {
    CALL_DISPLAY,
    CALL_LINK,
    WA_LINK,
    WA_TRACK_CLASS,
    WaIcon,
} from '@/Components/Public/WaFloat';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const IMG = '/assets/img/landing/residential';

const AWARDS = [
    { badge: 'ala-2026.png', title: 'Boutique Firm Of The Year' },
    { badge: 'ala-2025.png', title: 'Boutique Firm Of The Year' },
    { badge: 'dme-2024.png', title: 'Design & Build Project Of The Year' },
    { badge: 'ala-2024.png', title: 'Innovation In Architecture Award' },
    { badge: 'dme-2023.png', title: 'Landscape Project Of The Year' },
    { badge: 'ala-2023.png', title: 'Residential Project Of The Year' },
    { badge: 'dme-2022.png', title: 'Boutique Firm Of The Year' },
];

const FEATURES = [
    {
        img: `${IMG}/gallery-06.jpg`,
        title: 'Italian Heritage & 50-Year Legacy',
        desc: 'With roots in Italy and Europe spanning nearly five decades, we bring timeless European craftsmanship and design excellence to Dubai projects',
    },
    {
        img: `${IMG}/gallery-08.jpg`,
        title: 'All‑in‑One Design & Fit‑Out Service',
        desc: 'From concept to completion, our team manages every detail—design, permit sourcing, artwork curation, furniture selection, and installation—through a single streamlined process',
    },
    {
        img: `${IMG}/gallery-10.jpg`,
        title: 'Customised & Personalised Spaces',
        desc: 'Every renovation is tailored to reflect your personality and lifestyle, creating bespoke homes and offices infused with art, special pieces, and unique design solutions',
    },
    {
        img: `${IMG}/gallery-07.jpg`,
        title: 'Holistic Approach for Seamless Flow',
        desc: 'We reimagine spaces with a 360º view—ensuring kitchen, living, and outdoor areas work together harmoniously, improving both function and aesthetic cohesion',
    },
    {
        img: `${IMG}/gallery-09.jpg`,
        title: 'Trusted Reputation & Proven Results',
        desc: "Recognised as one of Dubai's top renovation firms—ranked 18th on the 2023 Fit‑Out Powerlist—and celebrated in leading publications like Harper's Bazaar Arabia and B Living",
    },
    {
        img: `${IMG}/gallery-11.jpg`,
        title: 'On‑Time Delivery with Quality Assurance',
        desc: 'Known for professionalism, timeliness, and post‑completion care, clients commend our efficiency and top-tier workmanship, often backed by warranties',
    },
];

const GALLERY = [
    {
        src: `${IMG}/gallery-01.jpg`,
        alt: 'Fit out company in Dubai delivers a high-end kitchen with marble floors, clean lines, and luxury lighting accents.',
    },
    {
        src: `${IMG}/gallery-02.jpg`,
        alt: 'Interior fit-out companies in Dubai create modern living spaces with soft textures, custom furniture, and natural lighting.',
    },
    { src: `${IMG}/gallery-03.jpg`, alt: '' },
    {
        src: `${IMG}/gallery-04.jpg`,
        alt: 'Fit-out contractors in Dubai design luxurious bathrooms with floating vanities, gold fixtures, and ambient recessed lighting.',
    },
    {
        src: `${IMG}/gallery-05.jpg`,
        alt: 'The best interior fit-out company in Dubai builds elegant walk-in closets with mirrored wardrobes and custom shelving.',
    },
];

export default function Residential() {
    return (
        <PublicLayout>
            <Head title="Residential Fit-Out — Smart Renovation" />
            <main className="rl">
                <section className="rl-hero">
                    <div className="rl-hero__media">
                        <img src={`${IMG}/hero.jpg`} alt="" />
                        <span className="rl-hero__scrim" aria-hidden="true" />
                    </div>
                    <div className="rl-hero__content">
                        <h1 className="rl-hero__title reveal in">
                            <span className="rl-hero__title-row">
                                <img
                                    className="rl-hero__award"
                                    src={`${IMG}/award-winning.png`}
                                    alt=""
                                    width={130}
                                    height={130}
                                />
                                <span className="rl-hero__title-line">Award Winning Fit‑Out</span>
                            </span>
                            <span className="rl-hero__title-rest">Interior Design Company, Dubai</span>
                        </h1>
                        <p className="rl-hero__subhead reveal in" data-delay="1">
                            Get a Free Consultation With UAE’s Leading Fit-Out Experts
                        </p>
                        <p className="rl-hero__lead reveal in" data-delay="2">
                            At Smart Renovation Dubai, we don’t just renovate homes; we transform your villa,
                            penthouse, townhouse, or apartment into the sanctuary you’ve always dreamed of.
                        </p>
                        <p className="rl-hero__lead reveal in" data-delay="3">
                            We are the UAE’s most dominant design and fit-out company, specializing in comprehensive
                            home, villa, and apartment renovations, plus expert landscaping. Our secret? A personalized
                            touch combined with unparalleled execution. We don’t just build; we bring your vision to
                            life with precision and passion.
                        </p>
                        <div className="rl-hero__cta reveal in" data-delay="4">
                            <a className="btn btn--solid" href="#contact">
                                Book FREE Consultation
                            </a>
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={WA_LINK} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp Us
                            </a>
                        </div>
                    </div>
                </section>

                <section className="cta-band cta-band--contact" id="contact">
                    <div className="container cta-band__grid">
                        <div className="cta-band__intro">
                            <span className="eyebrow reveal">Let&apos;s talk</span>
                            <h2 className="cta-band__title reveal" data-delay="1">
                                Book FREE Consultation.
                            </h2>
                            <p className="cta-band__sub reveal" data-delay="2">
                                Tell us about your villa, apartment or home renovation. We answer fast — with a clear
                                plan and budget.
                            </p>
                            <div className="cta-band__actions reveal" data-delay="3">
                                <a
                                    className={`btn btn--wa ${WA_TRACK_CLASS}`}
                                    href={WA_LINK}
                                    target="_blank"
                                    rel="noopener"
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
                        <ContactForm source="residential" />
                    </div>
                </section>

                <section className="rl-awards" aria-label="Awards">
                    <div className="rl-awards-marquee">
                        <div className="rl-awards-marquee__track">
                            {[...AWARDS, ...AWARDS].map((a, i) => (
                                <article className="rl-award" key={`${a.badge}-${i}`}>
                                    <div className="rl-award__badge">
                                        <img src={`${IMG}/awards/${a.badge}`} alt={a.title} loading="lazy" />
                                    </div>
                                    <h3 className="rl-award__title">{a.title}</h3>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rl-gallery" aria-label="Residential project gallery">
                    <div className="rl-gallery__grid">
                        {GALLERY.map((g, i) => (
                            <figure key={g.src} className="reveal-img">
                                <img src={g.src} alt={g.alt} loading={i < 3 ? 'eager' : 'lazy'} />
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="rl-intro">
                    <div className="container rl-intro__inner">
                        <h2 className="rl-intro__title reveal in">
                            Smart Renovation Dubai: Your Complete Home Transformation Partner
                        </h2>
                        <p className="rl-intro__sub reveal in" data-delay="1">
                            Style-Oriented Fit-Out Company
                        </p>
                        <p className="rl-intro__body reveal in" data-delay="2">
                            We specialize in full-scale villa, apartment, and home renovations, fit-outs, and interior
                            design. From stunning kitchen and bathroom overhauls to complete floor transformations,
                            seamless extensions, and comprehensive interior redesigns – we handle it all. We don’t offer
                            single-room design services; our expertise lies in delivering integrated, end-to-end
                            solutions for your entire home.
                        </p>
                        <div className="rl-intro__actions reveal in" data-delay="3">
                            <a className="btn btn--solid" href="#contact">
                                Book Free Quote
                            </a>
                        </div>
                    </div>
                </section>

                <section className="rl-features">
                    <div className="container">
                        <ul className="rl-features__grid">
                            {FEATURES.map((f) => (
                                <li key={f.title} className="rl-feature reveal">
                                    <figure className="rl-feature__media">
                                        <img src={f.img} alt="" loading="lazy" />
                                    </figure>
                                    <h3 className="rl-features__title">{f.title}</h3>
                                    <p className="rl-features__desc">{f.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <ReviewsSection />

                <section className="rl-about">
                    <div className="container rl-about__grid">
                        <figure className="rl-about__media reveal-img">
                            <img src={`${IMG}/about.jpg`} alt="Marco and Cinzia of Smart Renovation" />
                        </figure>
                        <div>
                            <span className="eyebrow reveal">A Little About Us</span>
                            <p className="rl-about__lead reveal" data-delay="1">
                                Our goal is to create a beautiful, seamless and well executed project of an interior
                                that reflects a story.
                            </p>
                            <p className="rl-about__body reveal" data-delay="2">
                                Smart Renovation came to Dubai after 40 years of experience in Italy and Europe. Our
                                goal is to give your home, villa, apartment or office a unique renovation together with
                                search and import of art, paintings, furniture and special products. Even though every
                                renovation is unique, we strive to make yours exceptional.
                            </p>
                            <p className="rl-about__body reveal" data-delay="3">
                                If you want to bring your home/office to life, Smart Renovation is the clear choice for
                                all your Renovation needs.
                            </p>
                            <div className="rl-about__actions reveal" data-delay="4">
                                <a className="btn btn--solid" href="#contact">
                                    Book Free Quote
                                </a>
                                <a
                                    className={`btn btn--wa ${WA_TRACK_CLASS}`}
                                    href={WA_LINK}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <WaIcon /> WhatsApp Us
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rl-location" aria-label="Visit us">
                    <div className="container">
                        <div className="rl-location__card">
                            <div className="rl-location__copy reveal">
                                <h2 className="rl-location__title">
                                    Smart Renovation provides High Design with Smart Solutions, within a Smart Budget.
                                </h2>
                                <p className="rl-location__address">
                                    AC01 Building Sheik Zayed Road,
                                    <br />
                                    Office 106 – 108 Mezzanine Floor,
                                    <br />
                                    Dubai, UAE
                                </p>
                            </div>
                            <div className="rl-location__map reveal" data-delay="1">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3612.066683735771!2d55.215346399999994!3d25.1334363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b436b26e981%3A0xe68dd1fea5363912!2sSmart%20Renovation!5e0!3m2!1sen!2sae!4v1751878845157!5m2!1sen!2sae"
                                    title="Smart Renovation on Google Maps"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
