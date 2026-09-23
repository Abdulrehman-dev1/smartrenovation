<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProjectImageRequest;
use App\Models\Project;
use App\Support\ProjectImageStorage;
use Illuminate\Http\JsonResponse;

class ProjectImageController extends Controller
{
    public function __construct(private ProjectImageStorage $images) {}

    public function store(ProjectImageRequest $request, Project $project): JsonResponse
    {
        $this->authorizeProject($project);

        $collection = $request->validated('collection');
        $files = $request->file('files', []);

        if ($collection === 'cover') {
            $file = $files[0] ?? null;
            if (! $file) {
                return response()->json(['message' => 'No file provided.'], 422);
            }
            $path = $this->images->storeCover($project, $file);
            $project->refresh();

            return response()->json([
                'message' => 'Cover uploaded.',
                'cover' => $project->cover_image
                    ? ['path' => $project->cover_image, 'url' => $project->coverUrl(), 'name' => basename($project->cover_image)]
                    : null,
                'path' => $path,
            ]);
        }

        $field = $collection === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';
        $rooms = $request->input('rooms', []);
        if (! is_array($rooms)) {
            $rooms = [];
        }
        $this->images->appendGallery($project, $files, $field, array_values($rooms));
        $project->refresh();

        return response()->json([
            'message' => 'Images uploaded.',
            'images' => $project->presentGallery($field),
            'rooms' => $project->rooms,
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorizeProject($project);

        $path = request()->input('path');
        $collection = request()->input('collection', 'gallery');

        if ($collection === 'cover') {
            $this->images->clearCover($project);
        } else {
            $field = $collection === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';
            if (is_string($path) && $path !== '') {
                $this->images->removePath($project, $path, $field);
            }
        }

        $project->refresh();

        return response()->json([
            'message' => 'Image deleted.',
            'rooms' => $project->rooms,
        ]);
    }

    public function reorder(ProjectImageRequest $request, Project $project): JsonResponse
    {
        $this->authorizeProject($project);

        $collection = $request->validated('collection');
        $field = $collection === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';
        $this->images->reorder($project, $field, $request->validated('ordered_paths', []));

        return response()->json([
            'message' => 'Order saved.',
            'images' => $project->fresh()->presentGallery($field),
        ]);
    }

    public function transfer(ProjectImageRequest $request, Project $project): JsonResponse
    {
        $this->authorizeProject($project);

        $from = $request->validated('from');
        $to = $request->validated('to');
        $fromField = $from === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';
        $toField = $to === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';

        $this->images->transfer(
            $project,
            $fromField,
            $toField,
            $request->validated('paths', [])
        );

        $project->refresh();

        return response()->json([
            'message' => 'Images moved.',
            'gallery' => $project->presentGallery('gallery_images'),
            'gallery_hidden' => $project->presentGallery('gallery_hidden'),
            'rooms' => $project->rooms,
        ]);
    }

    public function updateRooms(ProjectImageRequest $request, Project $project): JsonResponse
    {
        $this->authorizeProject($project);

        $collection = $request->validated('collection');
        $field = $collection === 'gallery_hidden' ? 'gallery_hidden' : 'gallery_images';
        $this->images->setRooms($project, $field, $request->validated('updates', []));
        $project->refresh();

        return response()->json([
            'message' => 'Rooms updated.',
            'gallery' => $project->presentGallery('gallery_images'),
            'gallery_hidden' => $project->presentGallery('gallery_hidden'),
            'rooms' => $project->rooms,
        ]);
    }

    private function authorizeProject(Project $project): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('projects.edit') || $user->can('projects.create')),
            403
        );
    }
}
