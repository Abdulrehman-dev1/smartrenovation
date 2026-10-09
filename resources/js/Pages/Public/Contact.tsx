import ContactForm from '@/Components/Public/ContactForm';
import { WA_TRACK_CLASS, WaIcon } from '@/Components/Public/WaFloat';
import { useSiteContact } from '@/hooks/useSiteContact';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
    const { callLink, whatsappLink, phone, email, address } = useSiteContact();

    return (
        <PublicLayout>
            <Head title="Contact — Smart Renovation" />
            <main className="contact">
                <section className="cta-band cta-band--contact" id="contact">
                    <div className="cta-band__grid">
                        <div className="cta-band__intro">
                            <span className="eyebrow reveal">Let&apos;s talk</span>
                            <h1 className="cta-band__title reveal" data-delay="1">
                                Start Your Project.
                            </h1>
                            <p className="cta-band__sub reveal" data-delay="2">
                                Tell us about your space and timeline — we reply fast with a clear plan.
                            </p>
                            <div className="cta-band__actions reveal" data-delay="3">
                                <a
                                    className={`btn btn--wa ${WA_TRACK_CLASS}`}
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <WaIcon /> WhatsApp
                                </a>
                                <a className="btn btn--solid" href={callLink}>
                                    Call Us
                                </a>
                                <a className="btn btn--light" href={`mailto:${email}`}>
                                    Email
                                </a>
                            </div>
                            <div className="cta-band__meta reveal" data-delay="4">
                                <span>{address || 'Sheikh Zayed Road, Dubai, UAE'}</span>
                                <span>{phone}</span>
                                <span>{email}</span>
                            </div>
                        </div>
                        <ContactForm source="contact" />
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
