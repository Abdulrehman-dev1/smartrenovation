<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Award;
use App\Models\Project;
use App\Services\SeoBuilder;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(SeoBuilder $seo): Response
    {
        $featuredProjects = Project::query()
            ->published()
            ->with(['category', 'location'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->take(4)
            ->get()
            ->map(fn (Project $project) => [
                'slug' => $project->slug,
                'name' => $project->name,
                'img' => $project->coverUrl(),
                'meta' => collect([
                    $project->category?->type_label ?? $project->category?->name,
                    $project->published_at?->format('Y'),
                ])->filter()->implode(' · '),
            ]);

        $awards = Award::query()
            ->published()
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->take(12)
            ->get()
            ->map(fn (Award $award) => [
                'img' => $award->coverUrl(),
                'year' => $award->year,
                'title' => $award->title,
                'org' => $award->organization,
            ]);

        return Inertia::render('Public/Home', [
            'featuredProjects' => $featuredProjects,
            'awards' => $awards,
            'seoJsonLd' => $seo->toJson($seo->organization()),
        ]);
    }
}
