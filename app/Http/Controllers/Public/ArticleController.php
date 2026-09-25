<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\SeoBuilder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect('/media?tab=articles');
    }

    public function show(string $slug, SeoBuilder $seo): Response
    {
        $article = Article::query()->published()->where('slug', $slug)->firstOrFail();

        $seoJsonLd = $article->schema_json
            ?: $seo->toJson($seo->article(
                $article->meta_title ?: $article->title,
                (string) ($article->meta_description ?? $article->subtitle),
                array_filter([
                    'datePublished' => $article->published_at?->toIso8601String(),
                    'image' => $article->coverUrl(),
                    'url' => $article->canonical_url ?: url()->current(),
                ])
            ));

        $ordered = Article::query()->published()->latest('published_at')->pluck('slug');
        $idx = $ordered->search($article->slug);
        $nextSlug = $idx === false
            ? null
            : $ordered[($idx + 1) % max($ordered->count(), 1)];
        $next = $nextSlug && $nextSlug !== $article->slug
            ? Article::query()->published()->where('slug', $nextSlug)->first()
            : null;

        return Inertia::render('Public/ArticleShow', [
            'article' => [
                'slug' => $article->slug,
                'title' => $article->title,
                'subtitle' => $article->subtitle,
                'description' => $article->description,
                'published_at' => $article->published_at?->toIso8601String(),
                'cover_url' => $article->coverUrl(),
                'meta_title' => $article->meta_title,
                'meta_description' => $article->meta_description,
                'canonical_url' => $article->canonical_url,
            ],
            'next' => $next ? [
                'slug' => $next->slug,
                'title' => $next->title,
                'cover_url' => $next->coverUrl(),
            ] : null,
            'seoJsonLd' => $seoJsonLd,
        ]);
    }
}
