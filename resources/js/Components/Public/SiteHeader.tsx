import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const NAV_LEFT = [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/works', label: 'Projects' },
    { href: '/collection', label: 'Collection' },
];

const NAV_RIGHT = [
    { href: '/media', label: 'Media' },
    { href: '/#contact', label: 'Contact' },
];

export default function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [url]);

    return (
        <>
            <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
                <nav className="site-nav site-nav--left">
                    {NAV_LEFT.map((l) => (
                        <Link key={l.label} href={l.href}>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <Link className="brand" href="/" aria-label="Smart Renovation">
                    <img className="brand__icon" src="/assets/img/brand/favicon.png" alt="" />
                    <span className="brand__word">Smart Renovation</span>
                </Link>

                <nav className="site-nav site-nav--right">
                    {NAV_RIGHT.map((l) =>
                        l.href.startsWith('/#') ? (
                            <a key={l.label} href={l.href}>
                                {l.label}
                            </a>
                        ) : (
                            <Link key={l.label} href={l.href}>
                                {l.label}
                            </Link>
                        ),
                    )}
                </nav>

                <button type="button" className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>

            <div className={`mobile-menu${open ? ' open' : ''}`}>
                {[...NAV_LEFT, ...NAV_RIGHT].map((l) =>
                    l.href.startsWith('/#') ? (
                        <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                            {l.label}
                        </a>
                    ) : (
                        <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>
                            {l.label}
                        </Link>
                    ),
                )}
            </div>
        </>
    );
}
