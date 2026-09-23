<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Project;
use App\Models\Service;
use App\Services\SeoBuilder;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(SeoBuilder $seo): Response
    {
        $featuredProjects = Project::query()
            ->published()
            ->with('location')
            ->latest('published_at')
            ->take(6)
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'slug' => $project->slug,
                'name' => $project->name,
                'subtitle' => $project->subtitle,
                'location' => $project->location?->name,
                'studio' => $project->studio,
                'cover' => $project->coverUrl()
                    ? ['original' => $project->coverUrl(), 'card' => $project->coverUrl(), 'large' => $project->coverUrl()]
                    : null,
            ]);

        return Inertia::render('Public/Home', [
            'featuredProjects' => $featuredProjects,
            'services' => Service::query()->published()->orderBy('title')->take(6)->get(['id', 'slug', 'title', 'subtitle']),
            'articles' => Article::query()->published()->latest('published_at')->take(3)->get(),
            'seoJsonLd' => $seo->toJson($seo->organization()),
        ]);
    }
}
