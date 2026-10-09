import { Head, Link } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';
import { useSiteContact } from '@/hooks/useSiteContact';

export default function ThankYou() {
    const { whatsappLink } = useSiteContact();
    return (
        <PublicLayout>
            <Head title="Thank You — Smart Renovation" />
            <main className="thank-you">
                <section
                    className="cta-band cta-band--contact"
                    style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}
                >
                    <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
                        <span className="eyebrow">Thank you</span>
                        <h1 className="cta-band__title" style={{ marginTop: 16 }}>
                            We&apos;ve received your message.
                        </h1>
                        <p className="cta-band__sub" style={{ margin: '18px auto 0' }}>
                            Our team will get back to you shortly. In the meantime, feel free to browse our work or
                            message us on WhatsApp.
                        </p>
                        <div className="cta-band__actions" style={{ justifyContent: 'center', marginTop: 28 }}>
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={whatsappLink} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp
                            </a>
                            <Link className="btn btn--solid" href="/works">
                                View Our Work
                            </Link>
                            <Link className="btn btn--light" href="/">
                                Back Home
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
