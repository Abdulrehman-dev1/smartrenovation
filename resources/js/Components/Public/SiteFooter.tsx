import { Link } from '@inertiajs/react';
import {
    CALL_DISPLAY,
    CALL_LINK,
    WA_DISPLAY,
    WA_LINK,
    WA_TRACK_CLASS,
} from '@/Components/Public/WaFloat';

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer__top">
                <div className="site-footer__brand">
                    <Link className="brand" href="/">
                        <img className="brand__icon" src="/assets/img/brand/favicon.png" alt="" />
                        <span className="brand__word">Smart Renovation</span>
                    </Link>
                    <p className="site-footer__tagline">
                        Reinventing properties since 1970 — design, build &amp; automation, held by one
                        studio in Dubai.
                    </p>
                </div>

                <nav className="site-footer__col">
                    <span className="site-footer__h">Explore</span>
                    <Link href="/about">About</Link>
                    <Link href="/services">Services</Link>
                    <Link href="/works">Projects</Link>
                    <Link href="/collection">Collection</Link>
                    <Link href="/media">Media</Link>
                    <a href="/#contact">Contact</a>
                </nav>

                <div className="site-footer__col site-footer__col--contact">
                    <span className="site-footer__h">Contact Us</span>
                    <span className="site-footer__muted">
                        AC01 Building, Sheikh Zayed Road,
                        <br />
                        Office 106–108, Mezzanine Floor,
                        <br />
                        Dubai, UAE
                    </span>
                    <a href="mailto:info@smartrenovation.ae">info@smartrenovation.ae</a>
                    <a href={CALL_LINK}>{CALL_DISPLAY}</a>
                    <a className={WA_TRACK_CLASS} href={WA_LINK} target="_blank" rel="noopener noreferrer">
                        WhatsApp · {WA_DISPLAY}
                    </a>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>© 2026 Smart Renovation</span>
                <span className="site-footer__muted">Design &amp; Build · Dubai, UAE</span>
            </div>
        </footer>
    );
}
