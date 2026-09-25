import { useMemo, useState } from 'react';

export type CollectionCandidate = {
    key: string;
    label: string;
    previewUrl: string;
    path?: string;
};

/** key → collection style (image is on the board when present). */
export type CollectionAssignment = Record<string, string>;

/** Default: cover + first 3 gallery → first style in list (caller can pass preferred). */
export function defaultCollectionAssignments(
    candidates: CollectionCandidate[],
    styles: string[],
    preferredStyle?: string,
): CollectionAssignment {
    const style =
        preferredStyle && styles.includes(preferredStyle) ? preferredStyle : (styles[0] ?? '');
    if (!style) return {};

    const keys: string[] = [];
    const cover = candidates.find((c) => c.key === 'cover');
    if (cover) keys.push(cover.key);
    candidates
        .filter((c) => c.key.startsWith('gallery:'))
        .slice(0, 3)
        .forEach((c) => keys.push(c.key));

    const out: CollectionAssignment = {};
    keys.forEach((k) => {
        out[k] = style;
    });
    return out;
}

function groupByStyle(
    candidates: CollectionCandidate[],
    assignments: CollectionAssignment,
    styles: string[],
): { style: string; items: CollectionCandidate[] }[] {
    const assignedKeys = new Set(Object.keys(assignments));
    const unassigned = candidates.filter((c) => !assignedKeys.has(c.key));

    const sections: { style: string; items: CollectionCandidate[] }[] = [];

    if (unassigned.length > 0) {
        sections.push({ style: 'Unassigned', items: unassigned });
    }

    styles.forEach((style) => {
        const items = candidates.filter((c) => assignments[c.key] === style);
        if (items.length > 0) {
            sections.push({ style, items });
        }
    });

    return sections;
}

export default function ProjectCollectionPicker({
    styles,
    candidates,
    assignments,
    onAssignmentsChange,
    imageError,
    busy = false,
}: {
    styles: string[];
    candidates: CollectionCandidate[];
    assignments: CollectionAssignment;
    onAssignmentsChange: (next: CollectionAssignment) => void;
    imageError?: string;
    busy?: boolean;
}) {
    const [pick, setPick] = useState<Set<string>>(new Set());
    const sections = useMemo(
        () => groupByStyle(candidates, assignments, styles),
        [candidates, assignments, styles],
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

    const assignStyle = (style: string | null) => {
        const keys = Array.from(pick);
        if (keys.length === 0) return;

        const next = { ...assignments };
        keys.forEach((key) => {
            if (style === null) {
                delete next[key];
            } else {
                next[key] = style;
            }
        });
        onAssignmentsChange(next);
        clearPick();
    };

    const pickCount = pick.size;
    const onBoardCount = Object.keys(assignments).length;

    return (
        <div className="space-y-4">
            <p className="text-xs text-slate-500">
                Assign images to a <strong className="font-medium text-slate-700">Collection type</strong>{' '}
                (Mediterranean, Italian Heritage, …). Only assigned images appear on the public Collection board.
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200">
                <div
                    className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 ${
                        pickCount > 0 ? 'border-indigo-100 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/80'
                    }`}
                >
                    <p className="mr-1 text-sm font-medium text-slate-700">Board images</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {onBoardCount} on board
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
                            <span className="text-xs text-slate-500">Collection type:</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {styles.map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => assignStyle(style)}
                                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {style}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => assignStyle(null)}
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
                        <p className="text-sm text-slate-500">No cover or gallery images yet.</p>
                    ) : (
                        sections.map((section) => (
                            <section key={section.style}>
                                <div className="mb-3 flex items-center gap-3">
                                    <h4 className="text-xs font-semibold tracking-wide text-slate-800">
                                        {section.style}
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
                                                                title="Select to assign collection type"
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
