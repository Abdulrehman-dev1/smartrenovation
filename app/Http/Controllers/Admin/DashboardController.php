<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Award;
use App\Models\Lead;
use App\Models\PressItem;
use App\Models\Project;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $projectPublished = Project::query()->where('status', 'published')->count();
        $projectDraft = Project::query()->where('status', 'draft')->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'projects' => $projectPublished + $projectDraft,
                'projects_published' => $projectPublished,
                'projects_draft' => $projectDraft,
                'services' => Service::query()->count(),
                'services_published' => Service::query()->where('status', 'published')->count(),
                'articles' => Article::query()->count(),
                'articles_published' => Article::query()->where('status', 'published')->count(),
                'press' => PressItem::query()->count(),
                'awards' => Award::query()->count(),
                'leads' => Lead::query()->count(),
                'leads_week' => Lead::query()->where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'recentProjects' => Project::query()
                ->with(['category', 'location'])
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'status' => $project->status,
                    'category' => $project->category?->name,
                    'location' => $project->location?->name,
                    'cover_url' => $project->coverUrl(),
                    'updated_at' => $project->updated_at?->toIso8601String(),
                ]),
            'recentLeads' => Lead::query()
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Lead $lead) => [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'created_at' => $lead->created_at?->toIso8601String(),
                ]),
            'recentArticles' => Article::query()
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (Article $article) => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'status' => $article->status,
                    'updated_at' => $article->updated_at?->toIso8601String(),
                ]),
        ]);
    }
}
