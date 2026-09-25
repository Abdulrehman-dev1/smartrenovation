<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Support\ArticleImageStorage;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ImportArticlesCommand extends Command
{
    protected $signature = 'smart:import-articles {--path=} {--with-images}';

    protected $description = 'Import articles from smart/content/articles.json';

    public function handle(): int
    {
        $path = $this->option('path') ?: base_path('../smart/content/articles.json');
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
        $images = app(ArticleImageStorage::class);
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug($item['title'] ?? '');
            if (! $slug) {
                continue;
            }

            $title = $item['title'] ?? $slug;
            $subtitle = $item['excerpt'] ?? null;
            $publishedAt = null;
            if (! empty($item['date'])) {
                try {
                    $publishedAt = \Carbon\Carbon::parse($item['date']);
                } catch (\Throwable) {
                    $publishedAt = now();
                }
            }

            $article = Article::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'subtitle' => $subtitle,
                    'description' => $item['html'] ?? '',
                    'status' => 'published',
                    'published_at' => $publishedAt ?? now(),
                    'meta_title' => $title,
                    'meta_description' => Str::limit(strip_tags((string) ($subtitle ?? '')), 155),
                ]
            );

            if ($this->option('with-images') && ! empty($item['cover']) && is_string($item['cover'])) {
                $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $item['cover']);
                if (File::exists($absolute)) {
                    $file = new UploadedFile($absolute, basename($absolute), null, null, true);
                    $images->storeCover($article, $file);
                }
            }

            $imported++;
        }

        $this->info("Imported {$imported} article(s).");

        return self::SUCCESS;
    }
}
