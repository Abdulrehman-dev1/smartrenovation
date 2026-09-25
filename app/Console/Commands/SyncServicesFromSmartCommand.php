<?php

namespace App\Console\Commands;

use App\Models\Service;
use App\Support\SmartServiceMapper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SyncServicesFromSmartCommand extends Command
{
    protected $signature = 'smart:sync-services {--path=}';

    protected $description = 'Sync service copy, order, and SEO fields from smart/content/services.json (keeps images)';

    public function handle(): int
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

        $updated = 0;
        foreach ($payload as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug((string) ($item['navLabel'] ?? $item['heroTitle'] ?? ''));
            if (! $slug) {
                continue;
            }

            $attrs = SmartServiceMapper::attributes($item, $index + 1);
            $attrs['published_at'] = now();

            $service = Service::query()->updateOrCreate(['slug' => $slug], $attrs);
            $updated++;
            $this->line(($index + 1)." → {$service->slug} ({$service->title})");
        }

        $this->info("Synced {$updated} service(s).");

        return self::SUCCESS;
    }
}
