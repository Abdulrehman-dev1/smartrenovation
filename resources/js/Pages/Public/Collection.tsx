import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';
import { CALL_LINK, WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

type Pin = {
    img: string;
    style: string;
    slug: string;
    title: string;
    ar?: number;
};

type Props = {
    items: Pin[];
    styles: string[];
};

export default function Collection({ items, styles }: Props) {
    const boardRef = useRef<HTMLElement | null>(null);
    const [style, setStyle] = useState('all');

    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get('style');
        if (q && (q === 'all' || styles.includes(q))) {
            setStyle(q);
            setTimeout(() => boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
        }
    }, [styles]);

    const stylePills = useMemo<[string, string][]>(
        () => [['all', 'All'], ...styles.map((s) => [s, s] as [string, string])],
        [styles],
    );

    const visible = style === 'all' ? items : items.filter((i) => i.style === style);

    const pick = (v: string) => {
        setStyle(v);
        const href = v === 'all' ? '/collection' : `/collection?style=${encodeURIComponent(v)}`;
        router.get(href, {}, { preserveState: true, preserveScroll: true, replace: true });
        boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <PublicLayout>
            <Head title="Collection — Smart Renovation" />
            <main className="collection">
                <section className="collection-intro container">
                    <span className="eyebrow reveal in">Collection</span>
                    <h1 className="collection-intro__title reveal in" data-delay="1">
                        Spaces, Materials &amp; <em>Mood.</em>
                    </h1>
                    <p className="collection-intro__lead reveal in" data-delay="2">
                        A living board of our real interiors — browse by the style that speaks to you.
                    </p>
                </section>

                <div className="filters">
                    <div className="filters__row">
                        <span className="filters__label">Style</span>
                        <div className="filters__pills">
                            {stylePills.map(([v, label]) => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`pill${style === v ? ' is-active' : ''}`}
                                    onClick={() => pick(v)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <section className="board" ref={boardRef as React.RefObject<HTMLElement>}>
                    {visible.map((p, i) => (
                        <article className="pin" key={p.img + i}>
                            <Link
                                className="pin__media"
                                href={`/projects/${p.slug}`}
                                style={{ aspectRatio: String(p.ar || 1.33) }}
                            >
                                <img src={p.img} alt="" loading="lazy" />
                                <span className="pin__tag">
                                    {p.style} · {p.title}
                                </span>
                            </Link>
                        </article>
                    ))}
                </section>

                <section className="cta-band" id="contact">
                    <div className="container">
                        <span className="eyebrow reveal">Let&apos;s talk</span>
                        <h2 className="cta-band__title reveal" data-delay="1">
                            Build Your Own.
                        </h2>
                        <p className="cta-band__sub reveal" data-delay="2">
                            Found a style you love? Let&apos;s turn it into your space.
                        </p>
                        <div className="cta-band__actions reveal" data-delay="3">
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={WA_LINK} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp Us
                            </a>
                            <a className="btn btn--solid" href={CALL_LINK}>
                                Call Us
                            </a>
                            <a className="btn btn--light" href="mailto:info@smartrenovation.ae">
                                Email
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
