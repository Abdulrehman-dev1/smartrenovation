<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use App\Support\ProjectTaxonomy;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(private ProjectImageStorage $images) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Project::class);

        return Inertia::render('Admin/Projects/Index', [
            'projects' => Project::query()
                ->with(['category', 'location'])
                ->latest()
                ->paginate(12)
                ->through(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'subtitle' => $project->subtitle,
                    'slug' => $project->slug,
                    'status' => $project->status,
                    'location' => $project->location?->name,
                    'category' => $project->category?->name,
                    'cover_url' => $project->coverUrl(),
                ]),
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
            ]),
        ]));
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = collect($request->validated())->except([
            'cover', 'gallery', 'gallery_hidden_files', 'gallery_rooms', 'gallery_hidden_rooms', 'rooms',
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

        return redirect()
            ->route('admin.projects.edit', $project->fresh())
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
}
