<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Support\RepairArticleCovers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RepairMissingArticleCoverImagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_restores_cover_from_existing_storage_file(): void
    {
        Storage::fake('public');

        $article = Article::query()->create([
            'slug' => 'why-extensions-are-gaining-popularity-in-dubai',
            'title' => 'Home Extensions',
            'status' => 'published',
            'published_at' => now(),
            'cover_image' => null,
        ]);

        $path = "articles/{$article->id}/cover/existing-cover.jpg";
        Storage::disk('public')->put($path, 'fake-image-bytes');

        $repaired = app(RepairArticleCovers::class)->run();

        $this->assertSame(1, $repaired);
        $article->refresh();
        $this->assertSame($path, $article->cover_image);
    }

    public function test_copies_cover_from_bundled_public_asset_when_storage_empty(): void
    {
        Storage::fake('public');

        $article = Article::query()->create([
            'slug' => 'why-extensions-are-gaining-popularity-in-dubai',
            'title' => 'Home Extensions',
            'status' => 'published',
            'published_at' => now(),
            'cover_image' => '',
        ]);

        $source = public_path('assets/img/articles/why-extensions-are-gaining-popularity-in-dubai/img-87.jpg');
        $this->assertFileExists($source);

        $repaired = app(RepairArticleCovers::class)->run();

        $this->assertSame(1, $repaired);
        $article->refresh();
        $this->assertNotEmpty($article->cover_image);
        $this->assertStringStartsWith("articles/{$article->id}/cover/", $article->cover_image);
        Storage::disk('public')->assertExists($article->cover_image);
    }
}
