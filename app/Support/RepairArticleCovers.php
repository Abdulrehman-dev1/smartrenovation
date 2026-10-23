<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RepairArticleCovers
{
    /**
     * Backfill empty article covers from existing storage files, or from
     * bundled public assets listed in database/data/smart/articles.json.
     *
     * @return int Number of articles repaired
     */
    public function run(): int
    {
        $articles = DB::table('articles')
            ->where(function ($query) {
                $query->whereNull('cover_image')->orWhere('cover_image', '');
            })
            ->get(['id', 'slug']);

        if ($articles->isEmpty()) {
            return 0;
        }

        $coversBySlug = $this->coversBySlug();
        $disk = Storage::disk('public');
        $publicRoot = SmartContent::publicRoot();
        $repaired = 0;

        foreach ($articles as $article) {
            $directory = 'articles/'.$article->id.'/cover';
            $existing = $disk->files($directory);

            if ($existing !== []) {
                DB::table('articles')->where('id', $article->id)->update([
                    'cover_image' => $existing[0],
                ]);
                $repaired++;

                continue;
            }

            $relative = $coversBySlug[$article->slug] ?? null;
            if (! is_string($relative) || $relative === '' || ! $publicRoot) {
                continue;
            }

            $absolute = $publicRoot.str_replace('/', DIRECTORY_SEPARATOR, $relative);
            if (! is_file($absolute)) {
                continue;
            }

            $ext = strtolower(pathinfo($absolute, PATHINFO_EXTENSION) ?: 'jpg');
            $path = $directory.'/'.Str::uuid()->toString().'.'.$ext;
            $disk->put($path, File::get($absolute));

            DB::table('articles')->where('id', $article->id)->update([
                'cover_image' => $path,
            ]);
            $repaired++;
        }

        return $repaired;
    }

    /**
     * @return array<string, string>
     */
    private function coversBySlug(): array
    {
        $jsonPath = SmartContent::json('articles.json');
        if (! $jsonPath) {
            return [];
        }

        $payload = json_decode(File::get($jsonPath), true);
        if (! is_array($payload)) {
            return [];
        }

        $map = [];
        foreach ($payload as $item) {
            if (! is_array($item)) {
                continue;
            }
            $slug = $item['slug'] ?? null;
            $cover = $item['cover'] ?? null;
            if (is_string($slug) && $slug !== '' && is_string($cover) && $cover !== '') {
                $map[$slug] = $cover;
            }
        }

        return $map;
    }
}
