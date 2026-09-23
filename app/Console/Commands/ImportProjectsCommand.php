<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportProjectsCommand extends Command
{
    protected $signature = 'smart:import-projects {--path=} {--with-images : Attach cover/gallery images from the Next.js public folder}';

    protected $description = 'Import projects from smart/content/projects.json';

    public function handle(ProjectImageStorage $images): int
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

        $imgRoot = base_path('../smart/public');
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug($item['title'] ?? $item['name'] ?? '');
            if (! $slug) {
                continue;
            }

            $categoryId = null;
            if (! empty($item['category'])) {
                $categoryId = Category::query()->where('slug', $item['category'])->value('id');
            }

            $locationId = null;
            if (! empty($item['location'])) {
                $locationId = Location::query()->where('name', $item['location'])->value('id');
            }

            $project = Project::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $item['title'] ?? $item['name'] ?? Str::title(str_replace('-', ' ', $slug)),
                    'category_id' => $categoryId,
                    'location_id' => $locationId,
                    'studio' => $item['studio'] ?? null,
                    'subtitle' => $item['subtitle'] ?? null,
                    'description' => $item['description'] ?? null,
                    'status' => 'published',
                    'published_at' => now(),
                    'meta_title' => $item['title'] ?? $item['name'] ?? null,
                    'meta_description' => Str::limit(strip_tags((string) ($item['description'] ?? '')), 155),
                ]
            );

            if ($this->option('with-images')) {
                $this->attachImage($images, $project, $item['cover'] ?? null, 'cover', $imgRoot);
                $this->attachMany($images, $project, $item['gallery'] ?? [], 'gallery_images', $imgRoot);
                $this->attachMany($images, $project, $item['galleryHidden'] ?? [], 'gallery_hidden', $imgRoot);
            }

            $imported++;
        }

        $this->info("Imported {$imported} project(s).");

        return self::SUCCESS;
    }

    protected function attachImage(
        ProjectImageStorage $images,
        Project $project,
        ?string $relative,
        string $collection,
        string $imgRoot
    ): void {
        if (! $relative) {
            return;
        }

        $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (! File::exists($absolute)) {
            $this->warn("Missing image: {$relative}");

            return;
        }

        $file = new UploadedFile($absolute, basename($absolute), null, null, true);

        if ($collection === 'cover') {
            $images->storeCover($project, $file);
        } else {
            $images->appendGallery($project, [$file], $collection);
        }
    }

    /**
     * @param  list<string>  $paths
     */
    protected function attachMany(
        ProjectImageStorage $images,
        Project $project,
        array $paths,
        string $field,
        string $imgRoot
    ): void {
        if ($project->{$field}) {
            foreach ($project->{$field} as $old) {
                $images->removePath($project, $old, $field);
            }
        }
        $project->forceFill([$field => []])->save();

        foreach ($paths as $relative) {
            if (! is_string($relative)) {
                continue;
            }
            $this->attachImage($images, $project, $relative, $field, $imgRoot);
        }
    }
}
