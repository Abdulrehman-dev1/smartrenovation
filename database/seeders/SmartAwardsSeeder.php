<?php

namespace Database\Seeders;

use App\Models\Award;
use App\Support\AwardImageStorage;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class SmartAwardsSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('../smart/content/awards.json');
        $imgRoot = base_path('../smart/public');

        if (! File::exists($path)) {
            $this->command?->error("Missing awards.json at {$path}");

            return;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->command?->error('Invalid awards.json');

            return;
        }

        $this->command?->info('Clearing awards table…');
        Award::query()->orderBy('id')->each(function (Award $award) {
            $award->delete();
        });

        $images = app(AwardImageStorage::class);
        $imported = 0;

        foreach ($payload as $row) {
            if (! is_array($row)) {
                continue;
            }

            $title = trim((string) ($row['title'] ?? ''));
            $organization = trim((string) ($row['organization'] ?? $row['org'] ?? ''));
            $year = trim((string) ($row['year'] ?? ''));
            if ($title === '' || $organization === '' || $year === '') {
                continue;
            }

            $award = Award::query()->create([
                'title' => $title,
                'organization' => $organization,
                'year' => $year,
                'status' => 'published',
            ]);

            $cover = $this->uploadedFile($row['img'] ?? null, $imgRoot);
            if ($cover) {
                $images->storeCover($award, $cover);
            } else {
                $this->command?->warn("Missing image for {$year} {$title}");
            }

            $imported++;
            $this->command?->info("Seeded award: {$year} — {$title}");
        }

        $this->command?->info("SmartAwardsSeeder finished — {$imported} award(s).");
    }

    private function uploadedFile(mixed $relative, string $imgRoot): ?UploadedFile
    {
        if (! is_string($relative) || $relative === '') {
            return null;
        }

        $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $relative);
        if (! File::exists($absolute)) {
            return null;
        }

        return new UploadedFile($absolute, basename($absolute), null, null, true);
    }
}
