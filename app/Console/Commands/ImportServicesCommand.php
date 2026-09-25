<?php

namespace App\Console\Commands;

use App\Models\Service;
use App\Support\ServiceImageStorage;
use App\Support\SmartServiceMapper;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportServicesCommand extends Command
{
    protected $signature = 'smart:import-services {--path=} {--with-images}';

    protected $description = 'Import services from smart/content/services.json';

    public function handle(ServiceImageStorage $images): int
    {
        $path = $this->option('path') ?: (\App\Support\SmartContent::json('services.json') ?? '');
        if (! $path || ! File::exists($path)) {
            $this->error('Path not found: services.json (put it in database/data/smart/)');

            return self::FAILURE;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->error('Invalid JSON.');

            return self::FAILURE;
        }

        $imgRoot = \App\Support\SmartContent::publicRoot() ?: base_path('../smart/public');
        $imported = 0;

        foreach ($payload as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug($item['navLabel'] ?? $item['heroTitle'] ?? '');
            if (! $slug) {
                continue;
            }

            $attrs = SmartServiceMapper::attributes($item, $index + 1);
            $attrs['published_at'] = now();

            $service = Service::query()->updateOrCreate(['slug' => $slug], $attrs);

            if ($this->option('with-images')) {
                if (! empty($item['cover'])) {
                    $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $item['cover']);
                    if (File::exists($absolute)) {
                        $images->storeCover(
                            $service,
                            new UploadedFile($absolute, basename($absolute), null, null, true)
                        );
                    }
                }
                if (! empty($item['gallery']) && is_array($item['gallery'])) {
                    $files = [];
                    foreach ($item['gallery'] as $rel) {
                        $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $rel);
                        if (File::exists($absolute)) {
                            $files[] = new UploadedFile($absolute, basename($absolute), null, null, true);
                        }
                    }
                    if ($files !== []) {
                        $images->appendGallery($service, $files);
                    }
                }
            }

            $imported++;
        }

        $this->info("Imported {$imported} service(s).");

        return self::SUCCESS;
    }
}
