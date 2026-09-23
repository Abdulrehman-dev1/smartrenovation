import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';

type Media = { card?: string | null; large?: string | null; original: string };
type Project = {
    id: number;
    slug: string;
    name: string;
    location?: string | null;
    studio?: string | null;
    category?: string | null;
    rooms?: string[] | null;
    cover?: Media | null;
};

type RoomPhoto = {
    url: string;
    room: string;
    slug: string;
    name: string;
    category?: string | null;
    location?: string | null;
};

type CategoryOption = { id: number; value: string; label: string };
type LocationOption = { id: number; name: string };

type Props = {
    projects: Project[];
    roomPhotos?: RoomPhoto[];
    filters: { category: string; location: string; room: string };
    taxonomy: {
        categories: CategoryOption[];
        locations: LocationOption[];
        rooms: string[];
    };
};

function Pill({
    active,
    label,
    onClick,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
            }`}
        >
            {label}
        </button>
    );
}

export default function Works({ projects, roomPhotos = [], filters, taxonomy }: Props) {
    const apply = (patch: Partial<typeof filters>) => {
        const next = { ...filters, ...patch };
        const params: Record<string, string> = {};
        if (next.category !== 'all') params.category = next.category;
        if (next.location !== 'all') params.location = next.location;
        if (next.room !== 'all') params.room = next.room;
        router.get('/works', params, { preserveState: true, replace: true });
    };

    const reset = () => apply({ category: 'all', location: 'all', room: 'all' });
    const active = filters.category !== 'all' || filters.location !== 'all' || filters.room !== 'all';
    const roomView = filters.room !== 'all';
    const isEmpty = roomView ? roomPhotos.length === 0 : projects.length === 0;

    return (
        <PublicLayout title="Works">
            <Head title="Works" />

            <div className="mb-8 space-y-5">
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-500">Category</p>
                    <div className="flex flex-wrap gap-2">
                        <Pill active={filters.category === 'all'} label="All" onClick={() => apply({ category: 'all' })} />
                        {taxonomy.categories.map((c) => (
                            <Pill
                                key={c.value}
                                active={filters.category === c.value}
                                label={c.label}
                                onClick={() => apply({ category: c.value })}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-500">Location</p>
                    <div className="flex flex-wrap gap-2">
                        <Pill active={filters.location === 'all'} label="All" onClick={() => apply({ location: 'all' })} />
                        {taxonomy.locations.map((loc) => (
                            <Pill
                                key={loc.id}
                                active={filters.location === loc.name}
                                label={loc.name}
                                onClick={() => apply({ location: loc.name })}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-stone-500">Room</p>
                    <div className="flex flex-wrap gap-2">
                        <Pill active={filters.room === 'all'} label="All" onClick={() => apply({ room: 'all' })} />
                        {taxonomy.rooms.map((room) => (
                            <Pill
                                key={room}
                                active={filters.room === room}
                                label={room}
                                onClick={() => apply({ room })}
                            />
                        ))}
                    </div>
                </div>
                {active && (
                    <button type="button" onClick={reset} className="text-sm text-stone-600 underline">
                        Reset filters
                    </button>
                )}
            </div>

            {isEmpty ? (
                <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
                    <p className="text-lg font-medium text-stone-800">
                        {roomView
                            ? `No ${filters.room.toLowerCase()} photos match these filters.`
                            : 'No projects match these filters.'}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                        Try broadening your search by category, location, or room.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        className="mt-4 rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
                    >
                        Reset filters
                    </button>
                </div>
            ) : roomView ? (
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                    {roomPhotos.map((photo, index) => (
                        <Link
                            key={`${photo.slug}-${photo.url}-${index}`}
                            href={`/projects/${photo.slug}`}
                            className="mb-4 block break-inside-avoid overflow-hidden bg-stone-200"
                        >
                            <img src={photo.url} alt="" className="w-full object-cover" loading="lazy" />
                            <div className="bg-white px-3 py-2 text-sm text-stone-600">
                                <span className="font-medium text-stone-800">{photo.room}</span>
                                {' · '}
                                {photo.name}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                            <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                                {(project.cover?.card || project.cover?.large || project.cover?.original) && (
                                    <img
                                        src={project.cover.card || project.cover.large || project.cover.original}
                                        alt={project.name}
                                        className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                                    />
                                )}
                            </div>
                            <h2 className="mt-3 text-lg font-medium">{project.name}</h2>
                            <p className="text-sm text-stone-500">
                                {[project.location, project.studio].filter(Boolean).join(' · ')}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </PublicLayout>
    );
}
