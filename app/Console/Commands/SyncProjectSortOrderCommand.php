<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SyncProjectSortOrderCommand extends Command
{
    protected $signature = 'smart:sync-project-sort-order {--path=}';

    protected $description = 'Set projects.sort_order from smart/content/projects.json array order (1 = first)';

    public function handle(): int
    {
        $path = $this->option('path') ?: base_path('../smart/content/projects.json');

        if (! File::exists($path)) {
            $this->error("Path not found: {$path}");

            return self::FAILURE;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->error('Invalid JSON payload.');

            return self::FAILURE;
        }

        // Match smart lib/projects.js: only entries with a cover participate in the public list.
        $ordered = [];
        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }
            $cover = $item['cover'] ?? null;
            if (! is_string($cover) || $cover === '') {
                continue;
            }
            $slug = $item['slug'] ?? Str::slug((string) ($item['title'] ?? $item['name'] ?? ''));
            if ($slug !== '') {
                $ordered[] = $slug;
            }
        }

        $updated = 0;
        foreach ($ordered as $index => $slug) {
            $sortOrder = $index + 1;
            $n = Project::query()->where('slug', $slug)->update(['sort_order' => $sortOrder]);
            if ($n > 0) {
                $updated++;
            }
        }

        $first = $ordered[0] ?? null;
        $last = $ordered[count($ordered) - 1] ?? null;

        $this->info("Ordered ".count($ordered)." slug(s); updated {$updated} row(s).");
        if ($first && $last) {
            $this->line("sort_order 1 → {$first}");
            $this->line('sort_order '.count($ordered)." → {$last}");
        }

        return self::SUCCESS;
    }
}
