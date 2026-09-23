<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use App\Support\ProjectTaxonomy;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SmartProjectsSeeder extends Seeder
{
    /** Import only the first N projects from projects.json */
    private const LIMIT = 10;

    public function run(): void
    {
        $projectsPath = base_path('../smart/content/projects.json');
        $roomsPath = base_path('../smart/content/rooms.json');
        $imgRoot = base_path('../smart/public');

        if (! File::exists($projectsPath)) {
            $this->command?->error("Missing projects.json at {$projectsPath}");

            return;
        }

        if (! File::isDirectory($imgRoot)) {
            $this->command?->error("Missing smart public folder at {$imgRoot}");

            return;
        }

        $this->call(CategoryLocationSeeder::class);

        $payload = json_decode(File::get($projectsPath), true);
        if (! is_array($payload)) {
            $this->command?->error('Invalid projects.json');

            return;
        }

        // Wipe existing projects so only this seed set remains.
        $this->command?->info('Clearing projects table…');
        Project::query()->orderBy('id')->each(function (Project $project) {
            $project->delete();
        });

        $roomMap = $this->loadRoomMap($roomsPath);
        $images = app(ProjectImageStorage::class);
        $all = array_values(array_filter($payload, 'is_array'));
        $items = array_slice($all, 0, self::LIMIT);
        $imported = 0;

        foreach ($items as $item) {
            $slug = $item['slug'] ?? Str::slug((string) ($item['title'] ?? $item['name'] ?? ''));
            if (! $slug) {
                continue;
            }

            $rawTitle = (string) ($item['title'] ?? $item['name'] ?? Str::title(str_replace('-', ' ', $slug)));
            [$name, $titleSuffix] = $this->splitSmartTitle($rawTitle);
            $description = is_string($item['description'] ?? null) ? $item['description'] : null;
            $subtitle = is_string($item['subtitle'] ?? null) ? trim($item['subtitle']) : '';
            if ($subtitle === '' && $titleSuffix !== '') {
                $subtitle = $titleSuffix;
            }
            $subtitle = $subtitle !== '' ? $subtitle : null;

            $categoryId = null;
            if (! empty($item['category']) && is_string($item['category'])) {
                $categoryId = Category::query()->where('slug', $item['category'])->value('id');
            }

            $areaName = ProjectTaxonomy::resolveAreaFromSmartProject([
                'slug' => $slug,
                'title' => $item['title'] ?? null,
                'name' => $item['name'] ?? null,
                'location' => $item['location'] ?? null,
            ]);
            $locationId = null;
            if ($areaName) {
                $location = Location::query()->where('name', $areaName)->first();
                if (! $location) {
                    $baseSlug = Str::slug($areaName) ?: 'location';
                    $locSlug = $baseSlug;
                    $i = 2;
                    while (Location::query()->where('slug', $locSlug)->exists()) {
                        $locSlug = $baseSlug.'-'.$i;
                        $i++;
                    }
                    $location = Location::query()->create([
                        'name' => $areaName,
                        'slug' => $locSlug,
                    ]);
                }
                $locationId = $location->id;
            }

            $studio = is_string($item['studio'] ?? null) ? trim($item['studio']) : '';
            if ($studio === '') {
                $studio = 'Smart Renovation';
            }

            $project = Project::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'category_id' => $categoryId,
                    'location_id' => $locationId,
                    'studio' => $studio,
                    'subtitle' => $subtitle,
                    'description' => $description,
                    'status' => 'published',
                    'published_at' => now(),
                    'meta_title' => $name,
                    'meta_description' => Str::limit(strip_tags((string) $description), 155) ?: null,
                ]
            );

            $this->resetImages($images, $project);

            $this->attachCover($images, $project, $item['cover'] ?? null, $imgRoot);

            $galleryPaths = is_array($item['gallery'] ?? null) ? $item['gallery'] : [];
            $hiddenPaths = is_array($item['galleryHidden'] ?? null) ? $item['galleryHidden'] : [];
            $basenameRooms = $roomMap[$slug] ?? [];

            $tagged = $this->attachGalleryWithRooms(
                $images,
                $project,
                $galleryPaths,
                'gallery_images',
                $imgRoot,
                $basenameRooms
            );
            $this->attachGalleryWithRooms(
                $images,
                $project,
                $hiddenPaths,
                'gallery_hidden',
                $imgRoot,
                $basenameRooms
            );

            $project->refresh();
            $project->syncRoomsFromGallery();

            $imported++;
            $this->command?->info(sprintf(
                'Seeded %s (location=%s, studio=%s, room-tagged gallery=%d/%d)',
                $slug,
                $areaName ?: '—',
                $studio,
                $tagged['tagged'],
                $tagged['total']
            ));
        }

        $this->command?->info("SmartProjectsSeeder finished — {$imported} project(s).");
    }

    /**
     * @return array<string, array<string, string>> slug => [basename => room]
     */
    private function loadRoomMap(string $roomsPath): array
    {
        if (! File::exists($roomsPath)) {
            $this->command?->warn('rooms.json not found — gallery rooms default to Other.');

            return [];
        }

        $entries = json_decode(File::get($roomsPath), true);
        if (! is_array($entries)) {
            return [];
        }

        $allowed = array_flip(ProjectTaxonomy::imageRooms());
        $map = [];

        foreach ($entries as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $slug = $entry['slug'] ?? null;
            $img = $entry['img'] ?? null;
            $room = $entry['room'] ?? null;
            if (! is_string($slug) || ! is_string($img) || ! is_string($room) || ! isset($allowed[$room])) {
                continue;
            }
            $base = basename(parse_url($img, PHP_URL_PATH) ?: $img);
            if ($base === '' || $base === '.' || $base === '/') {
                continue;
            }
            $map[$slug][$base] = $room;
        }

        return $map;
    }

    private function resetImages(ProjectImageStorage $images, Project $project): void
    {
        if ($project->cover_image) {
            $images->clearCover($project);
        }

        foreach (['gallery_images', 'gallery_hidden'] as $field) {
            foreach ($project->normalizedGallery($field) as $item) {
                $images->removePath($project, $item['path'], $field);
            }
            $project->forceFill([$field => []])->save();
        }
    }

    private function attachCover(
        ProjectImageStorage $images,
        Project $project,
        mixed $relative,
        string $imgRoot
    ): void {
        if (! is_string($relative) || $relative === '') {
            return;
        }

        $file = $this->uploadedFile($relative, $imgRoot);
        if (! $file) {
            return;
        }

        $images->storeCover($project, $file);
    }

    /**
     * @param  list<mixed>  $paths
     * @param  array<string, string>  $basenameRooms
     * @return array{total: int, tagged: int}
     */
    private function attachGalleryWithRooms(
        ProjectImageStorage $images,
        Project $project,
        array $paths,
        string $field,
        string $imgRoot,
        array $basenameRooms
    ): array {
        $total = 0;
        $tagged = 0;

        foreach ($paths as $relative) {
            if (! is_string($relative) || $relative === '') {
                continue;
            }

            $file = $this->uploadedFile($relative, $imgRoot);
            if (! $file) {
                continue;
            }

            $total++;
            $base = basename(parse_url($relative, PHP_URL_PATH) ?: $relative);
            $room = $basenameRooms[$base] ?? ProjectTaxonomy::OTHER_ROOM;
            if ($room !== ProjectTaxonomy::OTHER_ROOM) {
                $tagged++;
            }
            $images->appendGallery($project, [$file], $field, [$room]);
        }

        return compact('total', 'tagged');
    }

    /**
     * Smart titles often look like "Name | Location" or "Name | Smart Renovation Dubai".
     * Keep only the main name; return a usable suffix when it is not the studio brand.
     *
     * @return array{0: string, 1: string}
     */
    private function splitSmartTitle(string $raw): array
    {
        $parts = array_values(array_filter(array_map('trim', explode('|', $raw)), fn (string $p) => $p !== ''));
        if ($parts === []) {
            return ['Untitled', ''];
        }

        $name = $parts[0];
        $suffix = $parts[1] ?? '';
        if ($suffix !== '' && preg_match('/smart\s*renovation/i', $suffix)) {
            $suffix = '';
        }

        return [$name, $suffix];
    }

    private function uploadedFile(string $relative, string $imgRoot): ?UploadedFile
    {
        $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (! File::exists($absolute)) {
            $this->command?->warn("Missing image: {$relative}");

            return null;
        }

        return new UploadedFile($absolute, basename($absolute), null, null, true);
    }
}
