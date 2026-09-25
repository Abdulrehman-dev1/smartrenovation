<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Support\ProjectTaxonomy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorksController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $category = $request->string('category')->toString()
            ?: $request->string('style')->toString()
            ?: 'all';
        $location = $request->string('location')->toString() ?: 'all';
        $room = $request->string('room')->toString() ?: 'all';

        $allowedRooms = ProjectTaxonomy::rooms();
        $categoryModel = $category !== 'all'
            ? Category::query()->where('slug', $category)->first()
            : null;
        $locationModel = $location !== 'all'
            ? Location::query()
                ->where(function ($q) use ($location) {
                    $q->where('name', $location)->orWhere('slug', $location);
                })
                ->first()
            : null;

        if ($category !== 'all' && ! $categoryModel) {
            $category = 'all';
        }
        if ($location !== 'all' && ! $locationModel) {
            $location = 'all';
        }
        if ($room !== 'all' && ! in_array($room, $allowedRooms, true)) {
            $room = 'all';
        }

        $query = Project::query()
            ->published()
            ->with(['category', 'location'])
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($categoryModel) {
            $query->where('category_id', $categoryModel->id);
        }
        if ($locationModel) {
            $query->where('location_id', $locationModel->id);
        }

        $projectsQuery = clone $query;
        $roomPhotos = [];
        $projects = [];

        if ($room !== 'all') {
            $roomPhotos = $projectsQuery->get()
                ->flatMap(function (Project $project) use ($room) {
                    return collect($project->normalizedGallery('gallery_images'))
                        ->filter(fn (array $item) => $item['room'] === $room)
                        ->map(fn (array $item) => [
                            'url' => $project->pathToUrl($item['path']),
                            'room' => $item['room'],
                            'slug' => $project->slug,
                            'name' => $project->name,
                            'category' => $project->category?->slug,
                            'location' => $project->location?->name,
                        ])
                        ->filter(fn (array $photo) => filled($photo['url']));
                })
                ->values()
                ->all();
        } else {
            $projects = $projectsQuery->get()->map(fn (Project $project) => [
                'id' => $project->id,
                'slug' => $project->slug,
                'name' => $project->name,
                'studio' => $project->studio,
                'location' => $project->location?->name,
                'type' => $project->category?->type_label,
                'category' => $project->category?->slug,
                'subtitle' => $project->subtitle,
                'rooms' => $project->rooms,
                'cover' => $project->coverUrl()
                    ? ['original' => $project->coverUrl(), 'card' => $project->coverUrl(), 'large' => $project->coverUrl()]
                    : null,
            ]);
        }

        return Inertia::render('Public/Works', [
            'projects' => $projects,
            'roomPhotos' => $roomPhotos,
            'filters' => [
                'category' => $category,
                'location' => $locationModel?->name ?? $location,
                'room' => $room,
            ],
            'taxonomy' => ProjectTaxonomy::formOptions(),
        ]);
    }
}
