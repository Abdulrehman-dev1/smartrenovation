<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use App\Support\ProjectTaxonomy;
use App\Support\SmartContent;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SmartProjectsSeeder extends Seeder
{
    /** Import all projects from projects.json (null = no limit). */
    private const ?int LIMIT = null;

    public function run(): void
    {
        $projectsPath = SmartContent::json('projects.json');
        $roomsPath = SmartContent::json('rooms.json');
        $collectionPath = SmartContent::json('collection.json');
        $imgRoot = SmartContent::publicRoot();

        if (! $projectsPath) {
            $this->command?->error('Missing projects.json (expected database/data/smart/projects.json)');

            return;
        }

        if (! $imgRoot) {
            $this->command?->error('Missing public assets root (public/assets or ../smart/public/assets)');

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
        $collectionBySlug = $this->loadCollectionBySlug($collectionPath);
        $images = app(ProjectImageStorage::class);
        $all = array_values(array_filter($payload, 'is_array'));
        $items = self::LIMIT === null ? $all : array_slice($all, 0, self::LIMIT);
        $total = count($items);
        $imported = 0;

        $this->command?->info("Importing {$total} project(s)…");

        foreach ($items as $index => $item) {
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
                    'sort_order' => $index + 1,
                    'published_at' => now(),
                    'meta_title' => $name,
                    'meta_description' => Str::limit(strip_tags((string) $description), 155) ?: null,
                    'collection_style' => null,
                    'collection_images' => null,
                ]
            );

            $this->resetImages($images, $project);

            $pathMap = [];
            $coverRelative = is_string($item['cover'] ?? null) ? $item['cover'] : null;
            $this->attachCover($images, $project, $coverRelative, $imgRoot, $pathMap);

            $galleryPaths = is_array($item['gallery'] ?? null) ? $item['gallery'] : [];
            $hiddenPaths = is_array($item['galleryHidden'] ?? null) ? $item['galleryHidden'] : [];
            $basenameRooms = $roomMap[$slug] ?? [];

            $tagged = $this->attachGalleryWithRooms(
                $images,
                $project,
                $galleryPaths,
                'gallery_images',
                $imgRoot,
                $basenameRooms,
                $pathMap
            );
            $this->attachGalleryWithRooms(
                $images,
                $project,
                $hiddenPaths,
                'gallery_hidden',
                $imgRoot,
                $basenameRooms,
                $pathMap
            );

            $project->refresh();
            $project->syncRoomsFromGallery();
            $collectionCount = $this->applyCollection($project, $slug, $pathMap, $collectionBySlug);

            $imported++;
            $this->command?->info(sprintf(
                '[%d/%d] Seeded %s (location=%s, studio=%s, room-tagged gallery=%d/%d, collection=%d, style=%s)',
                $imported,
                $total,
                $slug,
                $areaName ?: '—',
                $studio,
                $tagged['tagged'],
                $tagged['total'],
                $collectionCount,
                $project->fresh()->collection_style ?: '—'
            ));
        }

        $this->command?->info("SmartProjectsSeeder finished — {$imported} project(s).");
    }

    /**
     * Index collection.json by project slug.
     *
     * @return array<string, list<array{img: string, style: string, ar: float}>>
     */
    private function loadCollectionBySlug(?string $path): array
    {
        if (! $path || ! File::exists($path)) {
            $this->command?->warn('collection.json not found — projects will have no collection images.');

            return [];
        }

        $entries = json_decode(File::get($path), true);
        if (! is_array($entries)) {
            return [];
        }

        $allowed = array_flip(ProjectTaxonomy::collectionStyles());
        $bySlug = [];

        foreach ($entries as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $slug = $entry['slug'] ?? null;
            $img = $entry['img'] ?? null;
            $style = $entry['style'] ?? null;
            $ar = $entry['ar'] ?? null;

            if (! is_string($slug) || $slug === '' || ! is_string($img) || $img === '') {
                continue;
            }
            if (! is_string($style) || $style === '' || ! isset($allowed[$style])) {
                $style = 'Modern Minimalist';
            }

            $bySlug[$slug][] = [
                'img' => $img,
                'style' => $style,
                'ar' => (is_numeric($ar) && (float) $ar > 0)
                    ? (float) $ar
                    : ProjectTaxonomy::DEFAULT_COLLECTION_AR,
            ];
        }

        return $bySlug;
    }

    /**
     * Apply exact collection.json entries for this slug (cover / gallery / hidden).
     *
     * @param  array<string, string>  $pathMap  smart relative path => storage path
     * @param  array<string, list<array{img: string, style: string, ar: float}>>  $collectionBySlug
     */
    private function applyCollection(
        Project $project,
        string $slug,
        array $pathMap,
        array $collectionBySlug
    ): int {
        $entries = $collectionBySlug[$slug] ?? [];
        $images = [];

        foreach ($entries as $entry) {
            $relative = $entry['img'];
            $stored = $pathMap[$relative] ?? null;
            if (! is_string($stored) || $stored === '') {
                $this->command?->warn("Collection image not in cover/gallery/hidden for {$slug}: {$relative}");

                continue;
            }
            $images[] = [
                'path' => $stored,
                'ar' => $entry['ar'],
                'style' => $entry['style'],
            ];
        }

        if ($images === []) {
            $project->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return 0;
        }

        // Primary style = first entry's style (matches FE lead / first hit).
        $primaryStyle = $images[0]['style'];

        $project->forceFill([
            'collection_style' => $primaryStyle,
            'collection_images' => $images,
        ])->save();

        return count($images);
    }

    /**
     * @return array<string, array<string, string>> slug => [basename => room]
     */
    private function loadRoomMap(?string $roomsPath): array
    {
        if (! $roomsPath || ! File::exists($roomsPath)) {
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

        $project->forceFill([
            'collection_style' => null,
            'collection_images' => null,
        ])->save();
    }

    /**
     * @param  array<string, string>  $pathMap
     */
    private function attachCover(
        ProjectImageStorage $images,
        Project $project,
        mixed $relative,
        string $imgRoot,
        array &$pathMap
    ): void {
        if (! is_string($relative) || $relative === '') {
            return;
        }

        $file = $this->uploadedFile($relative, $imgRoot);
        if (! $file) {
            return;
        }

        $stored = $images->storeCover($project, $file);
        $pathMap[$relative] = $stored;
    }

    /**
     * @param  list<mixed>  $paths
     * @param  array<string, string>  $basenameRooms
     * @param  array<string, string>  $pathMap
     * @return array{total: int, tagged: int}
     */
    private function attachGalleryWithRooms(
        ProjectImageStorage $images,
        Project $project,
        array $paths,
        string $field,
        string $imgRoot,
        array $basenameRooms,
        array &$pathMap
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
            $added = $images->appendGallery($project, [$file], $field, [$room]);
            if (isset($added[0]['path'])) {
                $pathMap[$relative] = $added[0]['path'];
            }
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
