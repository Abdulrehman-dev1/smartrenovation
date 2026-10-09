<?php

namespace App\Support;

use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProjectSortOrder
{
    /** Next position after the current last project (1-based). */
    public static function next(): int
    {
        return (int) Project::query()->max('sort_order') + 1;
    }

    /**
     * Renumber all projects to 1..N using current display order.
     */
    public static function renumber(): void
    {
        $projects = Project::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'sort_order']);

        DB::transaction(function () use ($projects) {
            foreach ($projects as $index => $project) {
                $order = $index + 1;
                if ((int) $project->sort_order !== $order) {
                    $project->forceFill(['sort_order' => $order])->saveQuietly();
                }
            }
        });
    }

    /**
     * Place a project at a 1-based position, shifting others, then renumber 1..N.
     */
    public static function place(Project $project, int $position): void
    {
        $total = Project::query()->count();
        $position = max(1, min($position, max($total, 1)));

        DB::transaction(function () use ($project, $position) {
            // Park this project so unique shifting is simple.
            $project->forceFill(['sort_order' => 0])->saveQuietly();

            Project::query()
                ->where('id', '!=', $project->id)
                ->where('sort_order', '>=', $position)
                ->orderByDesc('sort_order')
                ->get(['id', 'sort_order'])
                ->each(function (Project $other) {
                    $other->forceFill(['sort_order' => (int) $other->sort_order + 1])->saveQuietly();
                });

            $project->forceFill(['sort_order' => $position])->saveQuietly();

            self::renumber();
        });
    }
}
