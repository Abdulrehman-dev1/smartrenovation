import { useSiteContact } from '@/hooks/useSiteContact';
import { Link } from '@inertiajs/react';

export default function SiteFooter() {
    const { phone, callLink, email, address } = useSiteContact();

    const addressLines =
        address.trim() !== ''
            ? address.split(/\n+/).map((line) => line.trim()).filter(Boolean)
            : ['AC01 Building, Sheikh Zayed Road,', 'Office 106–108, Mezzanine Floor,', 'Dubai, UAE'];

    return (
        <footer className="site-footer">
            <div className="site-footer__top">
                <div className="site-footer__brand">
                    <Link className="brand" href="/">
                        <img className="brand__icon" src="/assets/img/brand/favicon.png" alt="" />
                        <span className="brand__word">Smart Renovation</span>
                    </Link>
                    <p className="site-footer__tagline">
                        Reinventing properties since 1970 — Italian creativity. Beyond simple fit out.
                    </p>
                </div>

                <nav className="site-footer__col">
                    <span className="site-footer__h">Explore</span>
                    <Link href="/about">About</Link>
                    <Link href="/services">Services</Link>
                    <Link href="/works">Projects</Link>
                    <Link href="/media">Media</Link>
                    <a href="/#contact">Contact</a>
                </nav>

                <div className="site-footer__col site-footer__col--contact">
                    <span className="site-footer__h">Contact Us</span>
                    <span className="site-footer__muted">
                        {addressLines.map((line, i) => (
                            <span key={line + i}>
                                {line}
                                {i < addressLines.length - 1 ? <br /> : null}
                            </span>
                        ))}
                    </span>
                    <a href={`mailto:${email}`}>{email}</a>
                    <a href={callLink}>{phone}</a>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>© 2026 Smart Renovation</span>
                <span className="site-footer__muted">Design &amp; Build · Dubai, UAE</span>
            </div>
        </footer>
    );
}
