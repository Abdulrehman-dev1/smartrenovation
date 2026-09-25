<?php

namespace Database\Seeders;

use App\Models\PressItem;
use App\Support\PressItemStorage;
use App\Support\SmartContent;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class SmartPressSeeder extends Seeder
{
    public function run(): void
    {
        $path = SmartContent::json('press.json');
        $imgRoot = SmartContent::publicRoot();

        if (! $path) {
            $this->command?->error('Missing press.json (expected database/data/smart/press.json)');

            return;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->command?->error('Invalid press.json');

            return;
        }

        $this->command?->info('Clearing press_items table…');
        PressItem::query()->orderBy('id')->each(function (PressItem $item) {
            $item->delete();
        });

        $storage = app(PressItemStorage::class);
        $imported = 0;

        foreach ($payload as $index => $row) {
            if (! is_array($row)) {
                continue;
            }

            $title = trim((string) ($row['title'] ?? ''));
            $outlet = trim((string) ($row['outlet'] ?? ''));
            if ($title === '' || $outlet === '') {
                continue;
            }

            $item = PressItem::query()->create([
                'title' => $title,
                'outlet' => $outlet,
                'href' => is_string($row['href'] ?? null) ? $row['href'] : null,
                'status' => 'published',
            ]);

            $cover = $this->uploadedFile($row['img'] ?? null, $imgRoot ?? '');
            if ($cover) {
                $storage->storeCover($item, $cover);
            }

            $imported++;
            $this->command?->info("Seeded press: {$outlet} — {$title}");
        }

        $this->command?->info("SmartPressSeeder finished — {$imported} item(s).");
    }

    private function uploadedFile(mixed $relative, string $imgRoot): ?UploadedFile
    {
        if ($imgRoot === '' || ! is_string($relative) || $relative === '') {
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
