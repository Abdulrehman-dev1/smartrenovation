<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\SeoBuilder;
use App\Support\MediaPresenter;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        $articles = Article::query()
            ->published()
            ->with('media')
            ->latest('published_at')
            ->get()
            ->map(fn (Article $article) => array_merge($article->only([
                'id', 'slug', 'title', 'excerpt', 'published_on', 'published_at',
            ]), [
                'cover' => $article->getFirstMedia('cover')
                    ? MediaPresenter::toArray($article->getFirstMedia('cover'))
                    : null,
            ]));

        return Inertia::render('Public/Articles', [
            'articles' => $articles,
        ]);
    }

    public function show(string $slug, SeoBuilder $seo): Response
    {
        $article = Article::query()->published()->where('slug', $slug)->firstOrFail();
        $article->load('media');

        return Inertia::render('Public/ArticleShow', [
            'article' => array_merge($article->toArray(), [
                'cover' => $article->getFirstMedia('cover')
                    ? MediaPresenter::toArray($article->getFirstMedia('cover'))
                    : null,
            ]),
            'seoJsonLd' => $seo->toJson($seo->article(
                $article->meta_title ?: $article->title,
                (string) ($article->meta_description ?? $article->excerpt)
            )),
        ]);
    }
}
