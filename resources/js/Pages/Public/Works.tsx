import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PublicLayout from '../../Layouts/PublicLayout';
import { WaIcon, WA_TRACK_CLASS } from '../../Components/Public/WaFloat';
import { useSiteContact } from '@/hooks/useSiteContact';

type ProjectCard = {
    id: number;
    slug: string;
    name: string;
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
    filters: { category: string; location: string; room: string; search?: string };
    taxonomy: {
        categories: TaxCategory[];
        locations: TaxLocation[];
        rooms: string[];
    };
};

function buildHref(cat: string, loc: string, room: string, search: string): string {
    const sp = new URLSearchParams();
    if (cat && cat !== 'all') sp.set('category', cat);
    if (loc && loc !== 'all') sp.set('location', loc);
    if (room && room !== 'all') sp.set('room', room);
    const q = search.trim();
    if (q) sp.set('search', q);
    const qs = sp.toString();
    return qs ? `/works?${qs}` : '/works';
}

function FilterDropdown({
    label,
    list,
    value,
    onPick,
    open,
    onToggle,
}: {
    label: string;
    list: [string, string][];
    value: string;
    onPick: (v: string) => void;
    open: boolean;
    onToggle: () => void;
}) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const selected = list.find(([v]) => v === value)?.[1] ?? 'All';
    const isActive = value !== 'all';

    useEffect(() => {
        if (!open) return;
        const onPointer = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) onToggle();
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onToggle();
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, onToggle]);

    return (
        <div className={`filters__dropdown${open ? ' is-open' : ''}${isActive ? ' is-active' : ''}`} ref={rootRef}>
            <button
                type="button"
                className="filters__dropdown-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={onToggle}
            >
                <span className="filters__dropdown-meta">
                    <span className="filters__dropdown-label">{label}</span>
                    <span className="filters__dropdown-value">{selected}</span>
                </span>
                <span className="filters__dropdown-chevron" aria-hidden>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>
            {open && (
                <ul className="filters__dropdown-menu" role="listbox" aria-label={label}>
                    {list.map(([v, lab]) => (
                        <li key={v} role="option" aria-selected={value === v}>
                            <button
                                type="button"
                                className={`filters__dropdown-option${value === v ? ' is-selected' : ''}`}
                                onClick={() => onPick(v)}
                            >
                                {lab}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Works({ projects, roomPhotos, filters, taxonomy }: Props) {
    const { whatsappLink, callLink, email } = useSiteContact();
    const gridRef = useRef<HTMLElement | null>(null);
    const filterKey = `${filters.category || 'all'}|${filters.location || 'all'}|${filters.room || 'all'}|${filters.search || ''}`;
    const prevFilterKey = useRef<string | null>(null);

    const [cat, setCat] = useState(filters.category || 'all');
    const [loc, setLoc] = useState(filters.location || 'all');
    const [room, setRoom] = useState(filters.room || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const [openDropdown, setOpenDropdown] = useState<'category' | 'location' | 'room' | null>(null);

    useEffect(() => {
        setCat(filters.category || 'all');
        setLoc(filters.location || 'all');
        setRoom(filters.room || 'all');
        setSearch(filters.search || '');
        setSearchInput(filters.search || '');
    }, [filters.category, filters.location, filters.room, filters.search]);

    // Scroll once after filters actually change (skip first mount).
    useEffect(() => {
        if (prevFilterKey.current === null) {
            prevFilterKey.current = filterKey;
            return;
        }
        if (prevFilterKey.current === filterKey) return;
        prevFilterKey.current = filterKey;

        const id = window.requestAnimationFrame(() => {
            gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => window.cancelAnimationFrame(id);
    }, [filterKey]);

    const categories = useMemo<[string, string][]>(
        () => [['all', 'All categories'], ...taxonomy.categories.map((c) => [c.value, c.label] as [string, string])],
        [taxonomy.categories],
    );
    const locations = useMemo<[string, string][]>(
        () => [['all', 'All locations'], ...taxonomy.locations.map((l) => [l.name, l.name] as [string, string])],
        [taxonomy.locations],
    );
    const rooms = useMemo<[string, string][]>(
        () => [['all', 'All rooms'], ...taxonomy.rooms.map((r) => [r, r] as [string, string])],
        [taxonomy.rooms],
    );

    const syncUrl = useCallback((next: { cat: string; loc: string; room: string; search: string }) => {
        router.get(buildHref(next.cat, next.loc, next.room, next.search), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, []);

    const apply = (patch: Partial<{ cat: string; loc: string; room: string; search: string }>) => {
        const next = {
            cat: patch.cat ?? cat,
            loc: patch.loc ?? loc,
            room: patch.room ?? room,
            search: patch.search ?? search,
        };
        if (patch.cat !== undefined) setCat(patch.cat);
        if (patch.loc !== undefined) setLoc(patch.loc);
        if (patch.room !== undefined) setRoom(patch.room);
        if (patch.search !== undefined) {
            setSearch(patch.search);
            setSearchInput(patch.search);
        }
        setOpenDropdown(null);
        syncUrl(next);
    };

    const submitSearch = (event?: React.FormEvent) => {
        event?.preventDefault();
        const nextSearch = searchInput.trim();
        setSearch(nextSearch);
        setSearchInput(nextSearch);
        setOpenDropdown(null);
        syncUrl({ cat, loc, room, search: nextSearch });
    };

    const clearSearch = () => {
        setSearchInput('');
        apply({ search: '' });
    };

    const resetFilters = () => {
        setCat('all');
        setLoc('all');
        setRoom('all');
        setSearch('');
        setSearchInput('');
        setOpenDropdown(null);
        syncUrl({ cat: 'all', loc: 'all', room: 'all', search: '' });
    };

    const toggleDropdown = useCallback((key: 'category' | 'location' | 'room') => {
        setOpenDropdown((current) => (current === key ? null : key));
    }, []);

    const filtersActive = cat !== 'all' || loc !== 'all' || room !== 'all' || search.trim() !== '';
    const roomView = room !== 'all';
    const isEmpty = roomView ? roomPhotos.length === 0 : projects.length === 0;

    const EmptyState = () => (
        <div className="grid__empty show" role="status">
            <p className="grid__empty-title">
                {search.trim()
                    ? `No projects match “${search.trim()}”.`
                    : roomView
                      ? `No ${room.toLowerCase()} photos match these filters.`
                      : 'No projects match these filters.'}
            </p>
            <p className="grid__empty-copy">
                More projects are coming. In the meantime, try broadening your search by title, category, location, or
                room.
            </p>
            <div className="grid__empty-actions">
                {search.trim() !== '' && (
                    <button type="button" className="pill" onClick={clearSearch}>
                        Clear search
                    </button>
                )}
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
                <section className="works-intro">
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
                    <form className="filters__search-row" onSubmit={submitSearch}>
                        <div className="filters__search">
                            <input
                                type="search"
                                className="filters__search-input"
                                placeholder="Search projects…"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                aria-label="Search projects by title, category, location, or room"
                            />
                            {searchInput.trim() !== '' && (
                                <button
                                    type="button"
                                    className="filters__search-clear"
                                    onClick={clearSearch}
                                    aria-label="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <button type="submit" className="filters__search-btn">
                            Search
                        </button>
                    </form>

                    <div className="filters__dropdowns">
                        <FilterDropdown
                            label="Category"
                            list={categories}
                            value={cat}
                            open={openDropdown === 'category'}
                            onToggle={() => toggleDropdown('category')}
                            onPick={(v) => apply({ cat: v })}
                        />
                        <FilterDropdown
                            label="Location"
                            list={locations}
                            value={loc}
                            open={openDropdown === 'location'}
                            onToggle={() => toggleDropdown('location')}
                            onPick={(v) => apply({ loc: v })}
                        />
                        <FilterDropdown
                            label="Room"
                            list={rooms}
                            value={room}
                            open={openDropdown === 'room'}
                            onToggle={() => toggleDropdown('room')}
                            onPick={(v) => apply({ room: v })}
                        />
                    </div>

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
                    <section className="works-grid" ref={gridRef as React.RefObject<HTMLElement>}>
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
                            <a className={`btn btn--wa ${WA_TRACK_CLASS}`} href={whatsappLink} target="_blank" rel="noopener">
                                <WaIcon /> WhatsApp
                            </a>
                            <a className="btn btn--solid" href={callLink}>
                                Call Us
                            </a>
                            <a className="btn btn--light" href={`mailto:${email}`}>
                                Email
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
