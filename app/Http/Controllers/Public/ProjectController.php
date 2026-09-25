<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\SeoBuilder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function show(string $slug, SeoBuilder $seo): Response
    {
        $query = Project::query()
            ->with(['category', 'location'])
            ->where('slug', $slug);

        $user = Auth::user();
        $canPreviewDraft = $user && $user->can('projects.view');

        if (! $canPreviewDraft) {
            $query->published();
        }

        $project = $query->firstOrFail();

        $isDraftPreview = $project->status !== 'published';

        $title = $project->meta_title ?: $project->name;
        $description = $project->meta_description
            ?: ($project->subtitle ?: Str::limit(strip_tags((string) $project->description), 160));
        $canonical = $project->canonical_url ?: url()->current();

        $jsonLd = $this->resolveJsonLd($project, $seo, $title, (string) $description);

        $ordered = Project::query()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('slug');
        $idx = $ordered->search($project->slug);
        $nextSlug = $idx === false
            ? null
            : $ordered[($idx + 1) % max($ordered->count(), 1)];
        $next = $nextSlug && $nextSlug !== $project->slug
            ? Project::query()->published()->with('location')->where('slug', $nextSlug)->first()
            : null;

        $rawDescription = (string) ($project->description ?? '');
        $descriptionHtml = $rawDescription !== '' && str_contains($rawDescription, '<')
            ? $rawDescription
            : null;
        $descriptionText = $descriptionHtml ? null : $rawDescription;

        return Inertia::render('Public/ProjectShow', [
            'project' => [
                'slug' => $project->slug,
                'name' => $project->name,
                'studio' => $project->studio ?: 'Smart Renovation',
                'subtitle' => $project->subtitle,
                'description' => $descriptionText,
                'description_html' => $descriptionHtml,
                'location' => $project->location?->name,
                'type' => $project->category?->type_label,
                'rooms' => $project->rooms,
                'cover' => $project->coverUrl(),
                'cover_ar' => 1.5,
                'gallery' => $project->galleryUrls(),
            ],
            'next' => $next ? [
                'slug' => $next->slug,
                'name' => $next->name,
                'location' => $next->location?->name,
                'cover' => $next->coverUrl(),
            ] : null,
            'previewDraft' => $isDraftPreview,
            'seo' => [
                'title' => $title,
                'description' => $description,
                'canonical' => $canonical,
                'jsonLd' => $jsonLd,
            ],
        ]);
    }

    private function resolveJsonLd(Project $project, SeoBuilder $seo, string $title, string $description): string
    {
        if ($project->schema_json) {
            $decoded = json_decode($project->schema_json, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $seo->toJson($decoded);
            }
        }

        return $seo->toJson($seo->webPage($title, $description));
    }
}
