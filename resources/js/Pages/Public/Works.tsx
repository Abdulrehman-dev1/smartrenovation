import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WaIcon, WA_LINK, WA_TRACK_CLASS } from '../../Components/Public/WaFloat';

type ProjectCard = {
    id: number;
    slug: string;
    name: string;
    studio?: string | null;
    location?: string | null;
    type?: string | null;
    category?: string | null;
    subtitle?: string | null;
    cover?: { original?: string; card?: string } | null;
};

type RoomPhoto = {
    url: string;
    room: string;
    slug: string;
    name: string;
    category?: string | null;
    location?: string | null;
    ar?: number;
};

type TaxCategory = { value: string; label: string };
type TaxLocation = { id: number; name: string };

type Props = {
    projects: ProjectCard[];
    roomPhotos: RoomPhoto[];
    filters: { category: string; location: string; room: string };
    taxonomy: {
        categories: TaxCategory[];
        locations: TaxLocation[];
        rooms: string[];
    };
};

function buildHref(cat: string, loc: string, room: string): string {
    const sp = new URLSearchParams();
    if (cat && cat !== 'all') sp.set('category', cat);
    if (loc && loc !== 'all') sp.set('location', loc);
    if (room && room !== 'all') sp.set('room', room);
    const q = sp.toString();
    return q ? `/works?${q}` : '/works';
}

export default function Works({ projects, roomPhotos, filters, taxonomy }: Props) {
    const gridRef = useRef<HTMLElement | null>(null);
    const scrolledFor = useRef('');

    const [cat, setCat] = useState(filters.category || 'all');
    const [loc, setLoc] = useState(filters.location || 'all');
    const [room, setRoom] = useState(filters.room || 'all');

    useEffect(() => {
        setCat(filters.category || 'all');
        setLoc(filters.location || 'all');
        setRoom(filters.room || 'all');
        const key = `${filters.category}|${filters.location}|${filters.room}`;
        if (key !== 'all|all|all' && scrolledFor.current !== key) {
            scrolledFor.current = key;
            setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
        }
    }, [filters.category, filters.location, filters.room]);

    const categories = useMemo<[string, string][]>(
        () => [['all', 'All'], ...taxonomy.categories.map((c) => [c.value, c.label] as [string, string])],
        [taxonomy.categories],
    );
    const locations = useMemo<[string, string][]>(
        () => [['all', 'All'], ...taxonomy.locations.map((l) => [l.name, l.name] as [string, string])],
        [taxonomy.locations],
    );
    const rooms = useMemo<[string, string][]>(
        () => [['all', 'All'], ...taxonomy.rooms.map((r) => [r, r] as [string, string])],
        [taxonomy.rooms],
    );

    const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const syncUrl = useCallback((next: { cat: string; loc: string; room: string }) => {
        router.get(buildHref(next.cat, next.loc, next.room), {}, { preserveScroll: true, preserveState: true, replace: true });
    }, []);

    const apply = (patch: Partial<{ cat: string; loc: string; room: string }>) => {
        const next = {
            cat: patch.cat ?? cat,
            loc: patch.loc ?? loc,
            room: patch.room ?? room,
        };
        if (patch.cat !== undefined) setCat(patch.cat);
        if (patch.loc !== undefined) setLoc(patch.loc);
        if (patch.room !== undefined) setRoom(patch.room);
        syncUrl(next);
        scrollToGrid();
    };

    const resetFilters = () => {
        setCat('all');
        setLoc('all');
        setRoom('all');
        syncUrl({ cat: 'all', loc: 'all', room: 'all' });
        scrollToGrid();
    };

    const filtersActive = cat !== 'all' || loc !== 'all' || room !== 'all';
    const roomView = room !== 'all';
    const isEmpty = roomView ? roomPhotos.length === 0 : projects.length === 0;

    const Pills = ({
        label,
        list,
        value,
        onPick,
    }: {
        label: string;
        list: [string, string][];
        value: string;
        onPick: (v: string) => void;
    }) => (
        <div className="filters__row">
            <span className="filters__label">{label}</span>
            <div className="filters__pills">
                {list.map(([v, lab]) => (
                    <button
                        key={v}
                        type="button"
                        className={`pill${value === v ? ' is-active' : ''}`}
                        onClick={() => onPick(v)}
                    >
                        {lab}
                    </button>
                ))}
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className="grid__empty show" role="status">
            <p className="grid__empty-title">
                {roomView
                    ? `No ${room.toLowerCase()} photos match these filters.`
                    : 'No projects match these filters.'}
            </p>
            <p className="grid__empty-copy">
                More projects are coming. In the meantime, try broadening your search by category, location, or room.
            </p>
            <div className="grid__empty-actions">
                {cat !== 'all' && (
                    <button type="button" className="pill" onClick={() => apply({ cat: 'all' })}>
                        All categories
                    </button>
                )}
                {loc !== 'all' && (
                    <button type="button" className="pill" onClick={() => apply({ loc: 'all' })}>
                        All locations
                    </button>
                )}
                {room !== 'all' && (
                    <button type="button" className="pill" onClick={() => apply({ room: 'all' })}>
                        All rooms
                    </button>
                )}
                <button type="button" className="pill is-active" onClick={resetFilters}>
                    Reset filters
                </button>
            </div>
        </div>
    );

    return (
        <PublicLayout>
            <Head title="Works — Smart Renovation" />
            <main className="works">
                <section className="works-intro container">
                    <span className="eyebrow reveal">Selected work</span>
                    <h1 className="works-intro__title reveal" data-delay="1">
                        Our Work, <em>Across Dubai.</em>
                    </h1>
                    <p className="works-intro__lead reveal" data-delay="2">
                        Turnkey renovation and fit-out across the city&apos;s most established communities — held by one
                        studio from design to handover.
                    </p>
                </section>

                <div className="filters">
                    <Pills label="Category" list={categories} value={cat} onPick={(v) => apply({ cat: v })} />
                    <Pills label="Location" list={locations} value={loc} onPick={(v) => apply({ loc: v })} />
                    <Pills label="Room" list={rooms} value={room} onPick={(v) => apply({ room: v })} />
                    {filtersActive && (
                        <div className="filters__reset">
                            <button type="button" className="filters__reset-btn" onClick={resetFilters}>
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>

                {roomView ? (
                    isEmpty ? (
                        <section className="container" ref={gridRef as React.RefObject<HTMLElement>}>
                            <EmptyState />
                        </section>
                    ) : (
                        <section className="board" ref={gridRef as React.RefObject<HTMLElement>}>
                            {roomPhotos.map((im, i) => (
                                <article className="pin" key={im.url + i}>
                                    <Link
                                        className="pin__media"
                                        href={`/projects/${im.slug}`}
                                        style={{ aspectRatio: String(im.ar || 1.33) }}
                                    >
                                        <img src={im.url} alt="" loading="lazy" />
                                        <span className="pin__tag">
                                            {im.room} · {im.name}
                                        </span>
                                    </Link>
                                </article>
                            ))}
                        </section>
                    )
                ) : (
                    <section className="works-grid container" ref={gridRef as React.RefObject<HTMLElement>}>
                        {projects.map((p, i) => {
                            const title = (p.name || '').split('|')[0].trim();
                            const where = p.location;
                            return (
                                <Link key={p.slug} className="work reveal in" href={`/projects/${p.slug}`}>
                                    <div className="work__media reveal-img in">
                                        {p.cover?.card || p.cover?.original ? (
                                            <img src={p.cover.card || p.cover.original} alt="" loading="lazy" />
                                        ) : null}
                                    </div>
                                    <div className="work__info">
                                        <span className="work__no">{String(i + 1).padStart(2, '0')}</span>
                                        <h2 className="work__title">{title}</h2>
                                        <span className="work__meta">
                                            {[p.type, where].filter(Boolean).join(' · ')}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                        {isEmpty && <EmptyState />}
                    </section>
                )}

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
