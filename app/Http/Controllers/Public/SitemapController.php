<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [
            url('/'),
            url('/works'),
            url('/services'),
            url('/media'),
            url('/collection'),
            url('/about'),
            url('/contact'),
            url('/residential'),
        ];

        foreach (Project::query()->published()->get(['slug', 'updated_at']) as $project) {
            $urls[] = [
                'loc' => url('/works/'.$project->slug),
                'lastmod' => $project->updated_at?->toAtomString(),
            ];
        }

        foreach (Service::query()->published()->get(['slug', 'updated_at']) as $service) {
            $urls[] = [
                'loc' => url('/services/'.$service->slug),
                'lastmod' => $service->updated_at?->toAtomString(),
            ];
        }

        foreach (Article::query()->published()->get(['slug', 'updated_at']) as $article) {
            $urls[] = [
                'loc' => url('/media/'.$article->slug),
                'lastmod' => $article->updated_at?->toAtomString(),
            ];
        }

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
