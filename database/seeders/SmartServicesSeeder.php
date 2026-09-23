<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Support\ServiceImageStorage;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SmartServicesSeeder extends Seeder
{
    public function run(): void
    {
        $servicesPath = base_path('../smart/content/services.json');
        $imgRoot = base_path('../smart/public');

        if (! File::exists($servicesPath)) {
            $this->command?->error("Missing services.json at {$servicesPath}");

            return;
        }

        if (! File::isDirectory($imgRoot)) {
            $this->command?->error("Missing smart public folder at {$imgRoot}");

            return;
        }

        $payload = json_decode(File::get($servicesPath), true);
        if (! is_array($payload)) {
            $this->command?->error('Invalid services.json');

            return;
        }

        $this->command?->info('Clearing services table…');
        Service::query()->orderBy('id')->each(function (Service $service) {
            $service->delete();
        });

        $images = app(ServiceImageStorage::class);
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug((string) ($item['navLabel'] ?? $item['heroTitle'] ?? ''));
            if (! $slug) {
                continue;
            }

            $title = (string) ($item['heroTitle'] ?? $item['navLabel'] ?? Str::title(str_replace('-', ' ', $slug)));
            $subtitle = is_string($item['navLabel'] ?? null) ? trim($item['navLabel']) : null;
            if ($subtitle === $title) {
                $subtitle = null;
            }

            [$short, $html] = $this->blocksToCopy(is_array($item['blocks'] ?? null) ? $item['blocks'] : []);

            $service = Service::query()->create([
                'slug' => $slug,
                'title' => $title,
                'subtitle' => $subtitle,
                'short_description' => $short,
                'description' => $html,
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => is_string($item['metaTitle'] ?? null) ? $item['metaTitle'] : null,
                'meta_description' => is_string($item['metaDescription'] ?? null) ? $item['metaDescription'] : null,
            ]);

            $cover = $this->uploadedFile($item['cover'] ?? null, $imgRoot);
            if ($cover) {
                $images->storeCover($service, $cover);
            }

            $galleryFiles = [];
            if (is_array($item['gallery'] ?? null)) {
                foreach ($item['gallery'] as $rel) {
                    $file = $this->uploadedFile($rel, $imgRoot);
                    if ($file) {
                        $galleryFiles[] = $file;
                    }
                }
            }
            if ($galleryFiles !== []) {
                $images->appendGallery($service, $galleryFiles);
            }

            $imported++;
            $this->command?->info("Seeded {$slug}");
        }

        $this->command?->info("SmartServicesSeeder finished — {$imported} service(s).");
    }

    /**
     * @param  list<mixed>  $blocks
     * @return array{0: string|null, 1: string|null}
     */
    private function blocksToCopy(array $blocks): array
    {
        $short = null;
        $parts = [];

        foreach ($blocks as $block) {
            if (! is_array($block)) {
                continue;
            }
            $tag = strtolower((string) ($block['tag'] ?? 'p'));
            $text = trim((string) ($block['text'] ?? ''));
            if ($text === '') {
                continue;
            }

            $safe = e($text);
            if ($tag === 'h2') {
                $parts[] = '<h2>'.$safe.'</h2>';
            } elseif ($tag === 'h3') {
                $parts[] = '<h3>'.$safe.'</h3>';
            } else {
                if ($short === null) {
                    $short = $text;
                } else {
                    $parts[] = '<p>'.$safe.'</p>';
                }
            }
        }

        $html = $parts === [] ? null : implode("\n", $parts);

        return [$short, $html];
    }

    private function uploadedFile(mixed $relative, string $imgRoot): ?UploadedFile
    {
        if (! is_string($relative) || $relative === '') {
            return null;
        }

        $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (! File::exists($absolute)) {
            $this->command?->warn("Missing image: {$relative}");

            return null;
        }

        return new UploadedFile($absolute, basename($absolute), null, null, true);
    }
}
