import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WA_LINK, WA_TRACK_CLASS, WaIcon } from '../../Components/Public/WaFloat';

const TABS: [string, string][] = [
    ['articles', 'Articles'],
    ['press', 'In The Press'],
    ['awards', 'Awards'],
];

type Article = { id: number; slug: string; title: string; cover_url?: string | null };
type Press = { id: number; title: string; outlet?: string | null; cover_url?: string | null; link_url?: string | null };
type Award = {
    id: number;
    title: string;
    organization?: string | null;
    year?: string | number | null;
    cover_url?: string | null;
};

type Props = {
    articles: Article[];
    press: Press[];
    awards: Award[];
    tab?: string;
};

export default function Media({ articles, press, awards, tab: initialTab = 'articles' }: Props) {
    const [tab, setTab] = useState(
        TABS.some(([id]) => id === initialTab) ? initialTab : 'articles',
    );
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get('tab');
        if (t && TABS.some(([id]) => id === t)) setTab(t);
    }, []);

    useEffect(() => {
        const root = panelRef.current;
        if (!root) return;
        const els = root.querySelectorAll('.reveal:not(.in), .reveal-img:not(.in)');
        if (!('IntersectionObserver' in window)) {
            els.forEach((e) => e.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        e.target.querySelectorAll?.('.reveal-img:not(.in)').forEach((c) => c.classList.add('in'));
                        io.unobserve(e.target);
                    }
                }),
            { threshold: 0, rootMargin: '0px 0px -6% 0px' },
        );
        els.forEach((e) => io.observe(e));
        return () => io.disconnect();
    }, [tab]);

    const pickTab = (id: string) => {
        setTab(id);
        const href = id === 'articles' ? '/media' : `/media?tab=${id}`;
        router.get(href, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <PublicLayout>
            <Head title="Media — Smart Renovation" />
            <main className="media">
                <section className="media-intro container">
                    <span className="eyebrow reveal">Media Coverage</span>
                    <h1 className="media-intro__title reveal" data-delay="1">
                        In The <em>Spotlight.</em>
                    </h1>
                    <p className="media-intro__lead reveal" data-delay="2">
                        Our articles, press features and industry awards — the story of Smart Renovation, told across
                        the media.
                    </p>
                </section>

                <nav className="media-tabs reveal">
                    {TABS.map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            className={`media-tab${tab === id ? ' is-active' : ''}`}
                            onClick={() => pickTab(id)}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="media-panel container" ref={panelRef} key={tab}>
                    {tab === 'articles' && (
                        <div className="media-grid">
                            {articles.map((a) => (
                                <Link key={a.slug} className="media-card reveal" href={`/articles/${a.slug}`}>
                                    <div className="media-card__media reveal-img">
                                        {a.cover_url ? <img src={a.cover_url} alt="" loading="lazy" /> : null}
                                    </div>
                                    <h3 className="media-card__title">{a.title}</h3>
                                </Link>
                            ))}
                        </div>
                    )}

                    {tab === 'press' && (
                        <div className="media-grid media-grid--press">
                            {press.map((p) => (
                                <a
                                    key={p.id}
                                    className="media-card reveal"
                                    href={p.link_url || '#'}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    <div className="media-card__media reveal-img">
                                        {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" /> : null}
                                    </div>
                                    <span className="media-card__outlet">{p.outlet}</span>
                                    <h3 className="media-card__title">{p.title}</h3>
                                </a>
                            ))}
                        </div>
                    )}

                    {tab === 'awards' && (
                        <div className="media-grid media-grid--awards">
                            {awards.map((a) => (
                                <div key={a.id} className="media-card">
                                    <div className="media-card__media reveal-img">
                                        {a.cover_url ? <img src={a.cover_url} alt="" loading="lazy" /> : null}
                                    </div>
                                    <span className="media-card__outlet">
                                        {a.year} · {a.organization}
                                    </span>
                                    <h3 className="media-card__title">{a.title}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <section className="cta-band" id="contact">
                    <div className="container">
                        <span className="eyebrow reveal">Let&apos;s talk</span>
                        <h2 className="cta-band__title reveal" data-delay="1">
                            Start Your Project.
                        </h2>
                        <p className="cta-band__sub reveal" data-delay="2">
                            Tell us about your space and timeline — we reply fast with a clear plan.
                        </p>
                        <div className="cta-band__actions reveal" data-delay="3">
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
