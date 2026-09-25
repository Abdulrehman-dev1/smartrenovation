<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Support\ProjectTaxonomy;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportRoomTagsCommand extends Command
{
    protected $signature = 'projects:import-room-tags
                            {--path= : Path to rooms.json (default: ../smart/content/rooms.json)}
                            {--dry-run : Show matches without writing}';

    protected $description = 'Apply room tags from smart/content/rooms.json onto existing project gallery images by slug + basename';

    public function handle(): int
    {
        $default = \App\Support\SmartContent::json('rooms.json') ?? base_path('../smart/content/rooms.json');
        $path = $this->option('path') ?: $default;

        if (! is_file($path)) {
            $this->error('rooms.json not found (expected database/data/smart/rooms.json)');

            return self::FAILURE;
        }

        $entries = json_decode(File::get($path), true);
        if (! is_array($entries)) {
            $this->error('Invalid rooms.json');

            return self::FAILURE;
        }

        $allowed = array_flip(ProjectTaxonomy::imageRooms());
        $bySlug = [];
        foreach ($entries as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $slug = $entry['slug'] ?? null;
            $img = $entry['img'] ?? null;
            $room = $entry['room'] ?? null;
            if (! is_string($slug) || ! is_string($img) || ! is_string($room)) {
                continue;
            }
            if (! isset($allowed[$room])) {
                continue;
            }
            $base = basename(parse_url($img, PHP_URL_PATH) ?: $img);
            if ($base === '' || $base === '.' || $base === '/') {
                continue;
            }
            $bySlug[$slug][$base] = $room;
        }

        $dry = (bool) $this->option('dry-run');
        $updatedProjects = 0;
        $updatedImages = 0;
        $unmatched = 0;

        foreach ($bySlug as $slug => $basenameMap) {
            $project = Project::query()->where('slug', $slug)->first();
            if (! $project) {
                $unmatched += count($basenameMap);
                $this->warn("No project for slug: {$slug}");
                continue;
            }

            $changed = false;
            foreach (['gallery_images', 'gallery_hidden'] as $field) {
                $items = $project->normalizedGallery($field);
                $fieldChanged = false;
                foreach ($items as $i => $item) {
                    $base = basename($item['path']);
                    if (! isset($basenameMap[$base])) {
                        continue;
                    }
                    $room = $basenameMap[$base];
                    if ($item['room'] !== $room) {
                        $items[$i]['room'] = $room;
                        $fieldChanged = true;
                        $updatedImages++;
                    }
                    unset($basenameMap[$base]);
                }
                if ($fieldChanged) {
                    if (! $dry) {
                        $project->forceFill([$field => array_values($items)])->save();
                    }
                    $changed = true;
                }
            }

            $unmatched += count($basenameMap);
            if ($changed) {
                $updatedProjects++;
                if (! $dry) {
                    $project->syncRoomsFromGallery();
                }
                $this->line(($dry ? '[dry] ' : '')."Updated {$slug}");
            }
        }

        $this->info("Projects touched: {$updatedProjects}; images tagged: {$updatedImages}; unmatched tags: {$unmatched}");

        return self::SUCCESS;
    }
}
