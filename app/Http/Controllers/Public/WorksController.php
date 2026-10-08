<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
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
        $search = trim($request->string('search')->toString());
        if (mb_strlen($search) > 120) {
            $search = mb_substr($search, 0, 120);
        }

        $allowedRooms = ProjectTaxonomy::rooms();
        $allowedLocations = ProjectTaxonomy::worksFilterLocations();
        $categoryModel = $category !== 'all'
            ? Category::query()->where('slug', $category)->first()
            : null;

        if ($category !== 'all' && ! $categoryModel) {
            $category = 'all';
        }
        if ($location !== 'all' && ! in_array($location, $allowedLocations, true)) {
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

        if ($search !== '') {
            $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
            $like = '%'.$escaped.'%';
            $searchLower = mb_strtolower($search);

            $matchingLocationIds = collect(ProjectTaxonomy::worksNamedCommunities())
                ->filter(fn (string $name) => str_contains(mb_strtolower($name), $searchLower))
                ->flatMap(fn (string $community) => ProjectTaxonomy::locationIdsForWorksFilter($community))
                ->unique()
                ->values()
                ->all();

            $query->where(function ($q) use ($like, $matchingLocationIds) {
                $q->where('name', 'like', $like)
                    ->orWhere('subtitle', 'like', $like)
                    ->orWhere('slug', 'like', $like)
                    ->orWhere('rooms', 'like', $like)
                    ->orWhereHas('category', function ($categoryQuery) use ($like) {
                        $categoryQuery->where('name', 'like', $like)
                            ->orWhere('slug', 'like', $like)
                            ->orWhere('type_label', 'like', $like);
                    })
                    ->orWhereHas('location', function ($locationQuery) use ($like) {
                        $locationQuery->where('name', 'like', $like)
                            ->orWhere('slug', 'like', $like);
                    });

                if ($matchingLocationIds !== []) {
                    $q->orWhereIn('location_id', $matchingLocationIds);
                }
            });
        }

        if ($categoryModel) {
            $query->where('category_id', $categoryModel->id);
        }

        if ($location !== 'all') {
            $locationIds = ProjectTaxonomy::locationIdsForWorksFilter($location);

            if ($location === ProjectTaxonomy::OTHER_COMMUNITIES) {
                $query->where(function ($q) use ($locationIds) {
                    $q->whereNull('location_id');
                    if ($locationIds !== []) {
                        $q->orWhereIn('location_id', $locationIds);
                    }
                });
            } elseif ($locationIds !== []) {
                $query->whereIn('location_id', $locationIds);
            } else {
                $query->whereRaw('1 = 0');
            }
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

        $taxonomy = ProjectTaxonomy::formOptions();
        $taxonomy['locations'] = collect(ProjectTaxonomy::worksFilterLocations())
            ->map(fn (string $name) => ['id' => 0, 'name' => $name])
            ->values()
            ->all();

        return Inertia::render('Public/Works', [
            'projects' => $projects,
            'roomPhotos' => $roomPhotos,
            'filters' => [
                'category' => $category,
                'location' => $location,
                'room' => $room,
                'search' => $search,
            ],
            'taxonomy' => $taxonomy,
        ]);
    }
}
