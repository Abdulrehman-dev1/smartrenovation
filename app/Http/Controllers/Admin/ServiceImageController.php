<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ServiceImageRequest;
use App\Models\Service;
use App\Support\ServiceImageStorage;
use Illuminate\Http\JsonResponse;

class ServiceImageController extends Controller
{
    public function __construct(private ServiceImageStorage $images) {}

    public function store(ServiceImageRequest $request, Service $service): JsonResponse
    {
        $this->authorizeService();

        $collection = $request->validated('collection');
        $files = $request->file('files', []);

        if ($collection === 'cover') {
            $file = $files[0] ?? null;
            if (! $file) {
                return response()->json(['message' => 'No file provided.'], 422);
            }
            $path = $this->images->storeCover($service, $file);
            $service->refresh();

            return response()->json([
                'message' => 'Cover uploaded.',
                'cover' => $service->cover_image
                    ? ['path' => $service->cover_image, 'url' => $service->coverUrl(), 'name' => basename($service->cover_image)]
                    : null,
                'path' => $path,
            ]);
        }

        $this->images->appendGallery($service, $files);
        $service->refresh();

        return response()->json([
            'message' => 'Images uploaded.',
            'images' => $service->presentGallery(),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorizeService();

        $path = request()->input('path');
        $collection = request()->input('collection', 'gallery');

        if ($collection === 'cover') {
            $this->images->clearCover($service);
        } elseif (is_string($path) && $path !== '') {
            $this->images->removePath($service, $path);
        }

        $service->refresh();

        return response()->json([
            'message' => 'Image deleted.',
        ]);
    }

    public function reorder(ServiceImageRequest $request, Service $service): JsonResponse
    {
        $this->authorizeService();

        $this->images->reorder($service, $request->validated('ordered_paths', []));

        return response()->json([
            'message' => 'Order saved.',
            'images' => $service->fresh()->presentGallery(),
        ]);
    }

    private function authorizeService(): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('services.edit') || $user->can('services.create')),
            403
        );
    }
}
