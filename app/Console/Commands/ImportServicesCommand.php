<?php

namespace App\Console\Commands;

use App\Models\Service;
use App\Support\ServiceImageStorage;
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
        $path = $this->option('path') ?: base_path('../smart/content/services.json');
        if (! File::exists($path)) {
            $this->error("Path not found: {$path}");

            return self::FAILURE;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->error('Invalid JSON.');

            return self::FAILURE;
        }

        $imgRoot = base_path('../smart/public');
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug($item['navLabel'] ?? $item['heroTitle'] ?? '');
            if (! $slug) {
                continue;
            }

            $title = (string) ($item['heroTitle'] ?? $item['navLabel'] ?? $slug);
            $subtitle = is_string($item['navLabel'] ?? null) ? trim($item['navLabel']) : null;
            if ($subtitle === $title) {
                $subtitle = null;
            }

            [$short, $html] = $this->blocksToCopy(is_array($item['blocks'] ?? null) ? $item['blocks'] : []);

            $service = Service::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'subtitle' => $subtitle,
                    'short_description' => $short,
                    'description' => $html,
                    'meta_title' => $item['metaTitle'] ?? null,
                    'meta_description' => $item['metaDescription'] ?? null,
                    'status' => 'published',
                    'published_at' => now(),
                ]
            );

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

        return [$short, $parts === [] ? null : implode("\n", $parts)];
    }
}
