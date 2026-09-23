<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;
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
        $imported = 0;

        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }

            $slug = $item['slug'] ?? Str::slug($item['title'] ?? '');
            if (! $slug) {
                continue;
            }

            $article = Article::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $item['title'] ?? $slug,
                    'published_on' => $item['date'] ?? null,
                    'excerpt' => $item['excerpt'] ?? null,
                    'body' => $item['html'] ?? '',
                    'status' => 'published',
                    'published_at' => now(),
                    'meta_title' => $item['title'] ?? null,
                    'meta_description' => Str::limit(strip_tags((string) ($item['excerpt'] ?? '')), 155),
                ]
            );

            if ($this->option('with-images') && ! empty($item['cover'])) {
                $absolute = $imgRoot.str_replace('/', DIRECTORY_SEPARATOR, $item['cover']);
                if (File::exists($absolute)) {
                    $article->clearMediaCollection('cover');
                    $article->addMedia($absolute)->preservingOriginal()->toMediaCollection('cover');
                }
            }

            $imported++;
        }

        $this->info("Imported {$imported} article(s).");

        return self::SUCCESS;
    }
}
