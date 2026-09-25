import { Head } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type Member = { name: string; role: string; img?: string | null };
type AboutData = {
    heading: string;
    html: string;
    images?: string[];
};
type TeamData = {
    heading: string;
    intro?: string | null;
    members: Member[];
};

type Props = {
    about: AboutData;
    team: TeamData;
};

export default function About({ about, team }: Props) {
    return (
        <PublicLayout>
            <Head title="About — Smart Renovation" />
            <main className="about">
                <section className="about-intro container">
                    <span className="eyebrow">About Us</span>
                    <h1 className="about-intro__title">{about.heading}</h1>
                </section>

                {about.images && about.images.length > 0 && (
                    <section className="about-founders container">
                        {about.images.map((src, i) => (
                            <figure key={i} className="about-founders__img">
                                <img src={src} alt="" />
                            </figure>
                        ))}
                    </section>
                )}

                <article className="about-body container" dangerouslySetInnerHTML={{ __html: about.html }} />

                <section className="team" id="team">
                    <div className="container team__head">
                        <span className="eyebrow">The Team</span>
                        <h2 className="team__title">{team.heading}</h2>
                        {team.intro && <p className="team__intro">{team.intro}</p>}
                    </div>

                    <div className="container team__grid">
                        {team.members.map((m, i) => (
                            <figure key={m.name + i} className="team-card">
                                <div className="team-card__media">
                                    {m.img ? (
                                        <img src={m.img} alt={m.name} loading="lazy" />
                                    ) : (
                                        <span className="team-card__ph">{m.name?.[0]}</span>
                                    )}
                                </div>
                                <figcaption>
                                    <span className="team-card__name">{m.name}</span>
                                    <span className="team-card__role">{m.role}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="cta-band" id="contact">
                    <div className="container">
                        <span className="eyebrow">Let&apos;s talk</span>
                        <h2 className="cta-band__title">Work With Us.</h2>
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
