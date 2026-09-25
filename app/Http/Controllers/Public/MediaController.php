<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Award;
use App\Models\PressItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $tab = $request->string('tab')->toString() ?: 'articles';
        if (! in_array($tab, ['articles', 'press', 'awards'], true)) {
            $tab = 'articles';
        }

        $articles = Article::query()
            ->published()
            ->latest('published_at')
            ->get()
            ->map(fn (Article $article) => [
                'id' => $article->id,
                'slug' => $article->slug,
                'title' => $article->title,
                'subtitle' => $article->subtitle,
                'published_at' => $article->published_at?->toIso8601String(),
                'cover_url' => $article->coverUrl(),
            ]);

        $press = PressItem::query()
            ->published()
            ->latest()
            ->get()
            ->map(fn (PressItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'outlet' => $item->outlet,
                'cover_url' => $item->coverUrl(),
                'link_url' => $item->linkUrl(),
            ]);

        $awards = Award::query()
            ->published()
            ->orderByDesc('year')
            ->latest()
            ->get()
            ->map(fn (Award $award) => [
                'id' => $award->id,
                'title' => $award->title,
                'organization' => $award->organization,
                'year' => $award->year,
                'cover_url' => $award->coverUrl(),
            ]);

        return Inertia::render('Public/Media', [
            'articles' => $articles,
            'press' => $press,
            'awards' => $awards,
            'tab' => $tab,
        ]);
    }
}
