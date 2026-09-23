<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Support\MediaPresenter;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __invoke(): Response
    {
        $articles = Article::query()
            ->published()
            ->with('media')
            ->latest('published_at')
            ->get()
            ->map(fn (Article $article) => array_merge($article->only([
                'id', 'slug', 'title', 'excerpt', 'published_on',
            ]), [
                'cover' => $article->getFirstMedia('cover')
                    ? MediaPresenter::toArray($article->getFirstMedia('cover'))
                    : null,
            ]));

        return Inertia::render('Public/Media', [
            'articles' => $articles,
        ]);
    }
}
