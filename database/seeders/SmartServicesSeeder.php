<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Support\ServiceImageStorage;
use App\Support\SmartServiceMapper;
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

        foreach ($payload as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug((string) ($item['navLabel'] ?? $item['heroTitle'] ?? ''));
            if (! $slug) {
                continue;
            }

            $attrs = SmartServiceMapper::attributes($item, $index + 1);
            $attrs['slug'] = $slug;
            $attrs['published_at'] = now();

            $service = Service::query()->create($attrs);

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
            $this->command?->info('Seeded '.$slug);
        }

        $this->command?->info("SmartServicesSeeder finished — {$imported} service(s).");
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
