import ContactForm from '@/Components/Public/ContactForm';
import {
    CALL_DISPLAY,
    CALL_LINK,
    WA_LINK,
    WA_TRACK_CLASS,
    WaIcon,
} from '@/Components/Public/WaFloat';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

type Props = {
    contact?: {
        email?: string | null;
        phone?: string | null;
        address?: string | null;
    };
};

export default function Contact({ contact }: Props) {
    return (
        <PublicLayout>
            <Head title="Contact — Smart Renovation" />
            <main className="contact">
                <section className="cta-band cta-band--contact" id="contact">
                    <div className="container cta-band__grid">
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
                                <span>{contact?.address || 'Sheikh Zayed Road, Dubai, UAE'}</span>
                                <span>{contact?.phone || CALL_DISPLAY}</span>
                                <span>{contact?.email || 'info@smartrenovation.ae'}</span>
                            </div>
                        </div>
                        <ContactForm source="contact" />
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
