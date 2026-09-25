<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use App\Support\ProjectTaxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(private ProjectImageStorage $images) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'category' => trim((string) $request->string('category')),
            'location' => trim((string) $request->string('location')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = Project::query()->with(['category', 'location'])->orderBy('sort_order')->orderBy('id');

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        if ($filters['category'] !== '') {
            $query->where('category_id', (int) $filters['category']);
        }

        if ($filters['location'] !== '') {
            $query->where('location_id', (int) $filters['location']);
        }

        if (in_array($filters['status'], ['draft', 'published'], true)) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'subtitle' => $project->subtitle,
                    'slug' => $project->slug,
                    'status' => $project->status,
                    'sort_order' => $project->sort_order,
                    'location' => $project->location?->name,
                    'category' => $project->category?->name,
                    'cover_url' => $project->coverUrl(),
                ]),
            'filters' => $filters,
            'filterOptions' => [
                'categories' => Category::query()->orderBy('name')->get(['id', 'name'])
                    ->map(fn (Category $c) => ['value' => (string) $c->id, 'label' => $c->name])
                    ->values()
                    ->all(),
                'locations' => Location::query()->orderBy('name')->get(['id', 'name'])
                    ->map(fn (Location $l) => ['value' => (string) $l->id, 'label' => $l->name])
                    ->values()
                    ->all(),
            ],
            'can' => [
                'view' => request()->user()->can('projects.view'),
                'create' => request()->user()->can('projects.create'),
                'edit' => request()->user()->can('projects.edit'),
                'delete' => request()->user()->can('projects.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Admin/Projects/Create', ProjectTaxonomy::formOptions());
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except([
            'cover', 'gallery', 'gallery_hidden_files', 'gallery_rooms', 'gallery_hidden_rooms', 'rooms',
            'collection_entries', 'collection_keys', 'collection_style', 'collection_images',
        ])->all();

        $project = Project::query()->create($data);

        if ($request->file('cover')) {
            $this->images->storeCover($project, $request->file('cover'));
        }
        if ($request->file('gallery')) {
            $this->images->appendGallery(
                $project,
                $request->file('gallery'),
                'gallery_images',
                array_values($request->input('gallery_rooms', []))
            );
        }
        if ($request->file('gallery_hidden_files')) {
            $this->images->appendGallery(
                $project,
                $request->file('gallery_hidden_files'),
                'gallery_hidden',
                array_values($request->input('gallery_hidden_rooms', []))
            );
        }

        $project->refresh();
        $project->syncRoomsFromGallery();
        $this->applyCollectionFromCreate($project, $request);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project was successfully created.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['category', 'location']);

        return Inertia::render('Admin/Projects/Show', [
            'project' => array_merge($project->toArray(), [
                'category_name' => $project->category?->name,
                'location_name' => $project->location?->name,
                'type_label' => $project->category?->type_label,
                'cover' => $project->cover_image
                    ? [
                        'path' => $project->cover_image,
                        'url' => $project->coverUrl(),
                        'name' => basename($project->cover_image),
                    ]
                    : null,
                'gallery' => $project->presentGallery('gallery_images'),
                'gallery_hidden' => $project->presentGallery('gallery_hidden'),
                'collection_style' => $project->collection_style,
                'collection_images' => $project->presentCollectionImages(),
            ]),
            'can' => [
                'edit' => request()->user()->can('projects.edit'),
                'delete' => request()->user()->can('projects.delete'),
            ],
            'publicUrl' => url('/projects/'.$project->slug),
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        $project->load(['category', 'location']);

        return Inertia::render('Admin/Projects/Edit', array_merge(ProjectTaxonomy::formOptions(), [
            'project' => array_merge($project->toArray(), [
                'cover' => $project->cover_image
                    ? [
                        'path' => $project->cover_image,
                        'url' => $project->coverUrl(),
                        'name' => basename($project->cover_image),
                    ]
                    : null,
                'gallery' => $project->presentGallery('gallery_images'),
                'gallery_hidden' => $project->presentGallery('gallery_hidden'),
                'collection_style' => $project->collection_style,
                'collection_images' => $project->normalizedCollectionImages(),
                'collection_candidates' => $project->presentCollectionCandidates(),
            ]),
        ]));
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = collect($request->validated())->except([
            'cover', 'gallery', 'gallery_hidden_files', 'gallery_rooms', 'gallery_hidden_rooms', 'rooms',
            'collection_entries', 'collection_keys', 'collection_style', 'collection_images',
        ])->all();

        $project->update($data);

        if ($request->file('cover')) {
            $this->images->storeCover($project, $request->file('cover'));
        }
        if ($request->file('gallery')) {
            $this->images->appendGallery(
                $project,
                $request->file('gallery'),
                'gallery_images',
                array_values($request->input('gallery_rooms', []))
            );
        }
        if ($request->file('gallery_hidden_files')) {
            $this->images->appendGallery(
                $project,
                $request->file('gallery_hidden_files'),
                'gallery_hidden',
                array_values($request->input('gallery_hidden_rooms', []))
            );
        }

        $project->refresh();
        $this->applyCollectionFromUpdate($project, $request);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project was successfully updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'Project was successfully deleted.');
    }

    private function applyCollectionFromCreate(Project $project, StoreProjectRequest $request): void
    {
        $entries = $request->validated('collection_entries') ?? [];
        if (! is_array($entries) || $entries === []) {
            $project->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return;
        }

        $images = $project->resolveCollectionEntries($entries);
        if ($images === []) {
            $project->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return;
        }

        $project->forceFill([
            'collection_style' => $images[0]['style'],
            'collection_images' => $images,
        ])->save();
    }

    private function applyCollectionFromUpdate(Project $project, UpdateProjectRequest $request): void
    {
        $raw = $request->validated('collection_images') ?? [];

        if (! is_array($raw) || $raw === []) {
            $project->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return;
        }

        $existingAr = collect($project->normalizedCollectionImages())
            ->keyBy('path');

        $images = [];
        $seen = [];
        foreach ($raw as $item) {
            $normalized = Project::normalizeCollectionImageItem($item);
            if (! $normalized || isset($seen[$normalized['path']])) {
                continue;
            }
            if (! in_array($normalized['path'], $project->collectionCandidatePaths(), true)) {
                continue;
            }
            if (! isset($item['ar']) && $existingAr->has($normalized['path'])) {
                $normalized['ar'] = $existingAr->get($normalized['path'])['ar'];
            }
            $seen[$normalized['path']] = true;
            $images[] = $normalized;
        }

        if ($images === []) {
            $project->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return;
        }

        $project->forceFill([
            'collection_style' => $images[0]['style'],
            'collection_images' => $images,
        ])->save();
    }
}
