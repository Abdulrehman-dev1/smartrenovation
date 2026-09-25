import { useMemo, useState } from 'react';

export type RoomCandidate = {
    key: string;
    label: string;
    previewUrl: string;
    path?: string;
};

/** key → room name */
export type RoomAssignment = Record<string, string>;

function groupByRoom(
    candidates: RoomCandidate[],
    assignments: RoomAssignment,
    rooms: string[],
): { room: string; items: RoomCandidate[] }[] {
    const assignedKeys = new Set(Object.keys(assignments));
    const unassigned = candidates.filter((c) => !assignedKeys.has(c.key));

    const sections: { room: string; items: RoomCandidate[] }[] = [];

    if (unassigned.length > 0) {
        sections.push({ room: 'Unassigned', items: unassigned });
    }

    rooms.forEach((room) => {
        const items = candidates.filter((c) => assignments[c.key] === room);
        if (items.length > 0) {
            sections.push({ room, items });
        }
    });

    return sections;
}

export default function ProjectRoomsPicker({
    rooms,
    candidates,
    assignments,
    onAssignmentsChange,
    imageError,
    busy = false,
}: {
    rooms: string[];
    candidates: RoomCandidate[];
    assignments: RoomAssignment;
    onAssignmentsChange: (next: RoomAssignment) => void;
    imageError?: string;
    busy?: boolean;
}) {
    const [pick, setPick] = useState<Set<string>>(new Set());
    const sections = useMemo(
        () => groupByRoom(candidates, assignments, rooms),
        [candidates, assignments, rooms],
    );

    const togglePick = (key: string) => {
        setPick((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const selectAll = () => setPick(new Set(candidates.map((c) => c.key)));
    const clearPick = () => setPick(new Set());

    const assignRoom = (room: string | null) => {
        const keys = Array.from(pick);
        if (keys.length === 0) return;

        const next = { ...assignments };
        keys.forEach((key) => {
            if (room === null) {
                delete next[key];
            } else {
                next[key] = room;
            }
        });
        onAssignmentsChange(next);
        clearPick();
    };

    const pickCount = pick.size;
    const taggedCount = Object.keys(assignments).length;

    return (
        <div className="space-y-4">
            <p className="text-xs text-slate-500">
                Assign gallery images to a <strong className="font-medium text-slate-700">room</strong>{' '}
                (Living, Kitchen, …). Tagged rooms power the public Works room filters.
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200">
                <div
                    className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 ${
                        pickCount > 0 ? 'border-indigo-100 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/80'
                    }`}
                >
                    <p className="mr-1 text-sm font-medium text-slate-700">Gallery images</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {taggedCount} tagged
                    </span>
                    {imageError && <p className="text-xs font-medium text-rose-600">{imageError}</p>}

                    {candidates.length > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={selectAll}
                                className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                            >
                                Select all
                            </button>
                            <button
                                type="button"
                                onClick={clearPick}
                                className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                            >
                                Clear
                            </button>
                        </>
                    )}

                    {pickCount > 0 && (
                        <>
                            <span className="mx-1 h-4 w-px bg-slate-200" />
                            <span className="text-xs font-medium text-slate-700">{pickCount} selected</span>
                            <span className="text-xs text-slate-500">Room:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {rooms.map((room) => (
                                    <button
                                        key={room}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => assignRoom(room)}
                                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {room}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => assignRoom(null)}
                                    className="rounded-full border border-rose-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-6 p-4">
                    {candidates.length === 0 ? (
                        <p className="text-sm text-slate-500">No gallery images yet. Upload them in the Images tab.</p>
                    ) : (
                        sections.map((section) => (
                            <section key={section.room}>
                                <div className="mb-3 flex items-center gap-3">
                                    <h4 className="text-xs font-semibold tracking-wide text-slate-800">
                                        {section.room}
                                    </h4>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                        {section.items.length}
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
                                    {section.items.map((c) => {
                                        const picked = pick.has(c.key);
                                        const assigned = assignments[c.key] ?? '';
                                        return (
                                            <li key={c.key}>
                                                <div
                                                    className={`overflow-hidden rounded-xl border bg-white transition ${
                                                        picked
                                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                                            : assigned
                                                              ? 'border-slate-900 ring-2 ring-slate-900/10'
                                                              : 'border-slate-200'
                                                    }`}
                                                >
                                                    <div className="relative aspect-square bg-slate-100">
                                                        <label className="absolute left-2 top-2 z-10 inline-flex size-6 cursor-pointer items-center justify-center rounded-md bg-white/95 shadow-sm ring-1 ring-slate-200/80">
                                                            <input
                                                                type="checkbox"
                                                                className="size-3.5 rounded border-slate-400 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                                                                checked={picked}
                                                                onChange={() => togglePick(c.key)}
                                                                title="Select to assign room"
                                                            />
                                                        </label>
                                                        {c.previewUrl ? (
                                                            <img
                                                                src={c.previewUrl}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="flex h-full items-center justify-center text-xs text-slate-400">
                                                                No preview
                                                            </span>
                                                        )}
                                                        <span className="absolute right-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                                                            {c.label}
                                                        </span>
                                                        {assigned && (
                                                            <span className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                                                {assigned}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
