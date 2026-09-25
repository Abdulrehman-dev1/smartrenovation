<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Support\ArticleImageStorage;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class SmartArticlesSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('../smart/content/articles.json');
        $imgRoot = base_path('../smart/public');

        if (! File::exists($path)) {
            $this->command?->error("Missing articles.json at {$path}");

            return;
        }

        if (! File::isDirectory($imgRoot)) {
            $this->command?->error("Missing smart public folder at {$imgRoot}");

            return;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->command?->error('Invalid articles.json');

            return;
        }

        $this->command?->info('Clearing articles table…');
        Article::query()->orderBy('id')->each(function (Article $article) {
            $article->delete();
        });

        $images = app(ArticleImageStorage::class);
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug((string) ($item['title'] ?? ''));
            if (! $slug) {
                continue;
            }

            $title = (string) ($item['title'] ?? Str::title(str_replace('-', ' ', $slug)));
            $subtitle = is_string($item['excerpt'] ?? null) ? trim($item['excerpt']) : null;
            $description = is_string($item['html'] ?? null) ? $item['html'] : null;
            $publishedAt = null;
            if (! empty($item['date'])) {
                try {
                    $publishedAt = \Carbon\Carbon::parse($item['date']);
                } catch (\Throwable) {
                    $publishedAt = now();
                }
            }

            $article = Article::query()->create([
                'slug' => $slug,
                'title' => $title,
                'subtitle' => $subtitle,
                'description' => $description,
                'status' => 'published',
                'published_at' => $publishedAt ?? now(),
                'meta_title' => $title,
                'meta_description' => $subtitle ? Str::limit(strip_tags($subtitle), 155) : null,
                'canonical_url' => null,
                'schema_json' => null,
            ]);

            $cover = $this->uploadedFile($item['cover'] ?? null, $imgRoot);
            if ($cover) {
                $images->storeCover($article, $cover);
            }

            $imported++;
            $this->command?->info("Seeded {$slug}");
        }

        $this->command?->info("SmartArticlesSeeder finished — {$imported} article(s).");
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
