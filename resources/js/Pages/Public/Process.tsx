import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';
import { useSiteContact } from '@/hooks/useSiteContact';

const PILLARS = [
    {
        title: 'Listen & Collaborate',
        body: 'The success of planning your space depends on how well we understand your vision and capture and transform it, and build it into a reality. Our client’s wishes are the top priority of our design team and we encourage client participation at all stages from initial planning to the implementation of the project. We will discuss in-depth on project details about your goal and style inspiration.',
    },
    {
        title: 'Budget & Planning',
        body: 'We schedule all activities and budget management to ensure that a smooth and successful completion of your Interior Design project will exceed your expectations. We will be responsible for ordering all products, tracking them, coordinating with contractors, delivery of products, installation of floor and wall coverings, light fixtures and furniture.',
    },
    {
        title: 'Design & Installation',
        body: 'We will ensure the required space for all objects and provide proper maintenance. Our goal is to offer you an innovative and unique solution that ensures the perfect balance between aesthetics and functionality. Our commitment to our clients extends beyond the project completion, and we will offer the best services from inception to execution.',
    },
];

const STEPS = [
    { name: 'First Appointment', detail: 'with Client' },
    { name: 'Estimation', detail: '' },
    {
        name: 'Debrief Meeting',
        detail: 'Client, Estimator, Designer — discussion of all project details & any single client request.',
    },
    { name: 'Ideas Meeting', detail: 'Client & Deco Team share ideas, tiles selection, etc.' },
    {
        name: 'Concept Brief Meeting',
        detail: 'Deco Team, Brief Design Team & upload SDB → concept presentation & approval to client.',
    },
    {
        name: 'Drawing List',
        detail: '2D, 3D, shop drawings, detailed drawings — all must be approved in sequence & uploaded to SDB.',
    },
    {
        name: 'Kick-off Meeting',
        detail: 'Client, Estimator, Deco, Designer, Project Management & Mason',
    },
    { name: 'Mobilization', detail: '' },
    { name: 'Periodical Report & Site Meeting', detail: '' },
    { name: 'Final Handover', detail: '' },
    { name: 'Completion', detail: '' },
];

type Props = {
    seo?: { title?: string; description?: string };
};

export default function Process({ seo }: Props) {
    const { whatsappLink, callLink, email } = useSiteContact();
    const title = seo?.title ?? 'Our Design Process | From Vision to Reality';
    const description =
        seo?.description ??
        'One-stop-shop approach to how we work — from first appointment to final handover with Smart Renovation Dubai.';

    return (
        <PublicLayout>
            <Head title={title}>
                <meta head-key="description" name="description" content={description} />
            </Head>

            <main className="process-page">
                <section className="process-hero">
                    <span className="eyebrow">How We Work</span>
                    <p className="process-hero__eyebrow">One-Stop-Shop Approach To</p>
                    <h1 className="process-hero__title">How We Work</h1>
                </section>

                <section className="process-pillars" aria-label="Our approach">
                    {PILLARS.map((pillar) => (
                        <article key={pillar.title} className="process-pillar">
                            <h2 className="process-pillar__title">{pillar.title}</h2>
                            <p className="process-pillar__body">{pillar.body}</p>
                        </article>
                    ))}
                </section>

                <section className="process-steps" aria-label="Design process steps">
                    <div className="process-steps__head">
                        <span className="eyebrow">Process</span>
                        <h2 className="process-steps__title">
                            From vision <em>to reality</em>
                        </h2>
                    </div>
                    <ol className="process-steps__list">
                        {STEPS.map((step, index) => (
                            <li key={step.name} className="process-step">
                                <span className="process-step__no">{String(index + 1).padStart(2, '0')}</span>
                                <div className="process-step__copy">
                                    <h3 className="process-step__name">{step.name}</h3>
                                    {step.detail ? <p className="process-step__detail">{step.detail}</p> : null}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="process-beyond">
                    <span className="eyebrow">Beyond simple fit-out</span>
                    <h2 className="process-beyond__title">We’re with you every step of the way.</h2>
                    <p className="process-beyond__body">
                        Smart Renovation is one of the UAE’s most dominant renovation and fit-out companies in Dubai.
                        We are here to help you turn your house into your dream home or to give your office a complete
                        makeover the smart way.
                    </p>
                    <Link className="process-beyond__link" href="/contact">
                        Contact us
                    </Link>
                </section>

                <section className="cta-band" id="contact">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Start Your Project.</h2>
                        <p className="cta-band__sub">
                            Tell us about your space and timeline — we reply fast with a clear plan.
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
