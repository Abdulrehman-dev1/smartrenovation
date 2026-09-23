<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyMediaRequest;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Http\Requests\Admin\ReorderMediaRequest;
use App\Models\Article;
use App\Models\CollectionItem;
use App\Models\Service;
use App\Support\MediaPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaUploadController extends Controller
{
    public function tester(): Response
    {
        return Inertia::render('Admin/Media/Tester');
    }

    public function store(MediaUploadRequest $request): JsonResponse|RedirectResponse
    {
        $collection = $request->validated('collection') ?? 'gallery';
        $model = $this->resolveModel(
            $request->validated('model_type'),
            $request->validated('model_id')
        );

        $uploaded = [];

        foreach ($request->file('files', []) as $file) {
            if ($model instanceof HasMedia) {
                if ($collection === 'cover') {
                    $model->clearMediaCollection('cover');
                }
                $media = $model->addMedia($file)->toMediaCollection($collection);
            } else {
                $temp = Article::query()->firstOrCreate(
                    ['slug' => '_media-tester'],
                    [
                        'title' => 'Media Tester',
                        'status' => 'draft',
                    ]
                );
                $media = $temp->addMedia($file)->toMediaCollection($collection === 'cover' ? 'cover' : 'cover');
            }

            $uploaded[] = MediaPresenter::toArray($media);
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'message' => 'Upload received. Conversions are queued for processing.',
                'media' => $uploaded,
            ]);
        }

        return back()->with('success', 'Upload received. Conversions are queued for processing.');
    }

    public function destroy(DestroyMediaRequest $request, Media $media): JsonResponse|RedirectResponse
    {
        $this->assertCanManageParent($media);
        $media->delete();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Media deleted.']);
        }

        return back()->with('success', 'Media deleted.');
    }

    public function reorder(ReorderMediaRequest $request): JsonResponse|RedirectResponse
    {
        $ids = $request->validated('ordered_ids');

        foreach ($ids as $index => $id) {
            $media = Media::query()->find($id);
            if (! $media) {
                continue;
            }
            $this->assertCanManageParent($media);
            $media->order_column = $index + 1;
            $media->save();
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Order updated.']);
        }

        return back()->with('success', 'Order updated.');
    }

    public function status(Media $media): JsonResponse
    {
        $this->assertCanManageParent($media);

        return response()->json(MediaPresenter::toArray($media->fresh()));
    }

    protected function resolveModel(?string $type, ?int $id): ?HasMedia
    {
        if (! $type || ! $id) {
            return null;
        }

        return match ($type) {
            'service' => Service::query()->find($id),
            'article' => Article::query()->find($id),
            'collection_item' => CollectionItem::query()->find($id),
            default => null,
        };
    }

    protected function assertCanManageParent(Media $media): void
    {
        $model = $media->model;
        abort_unless($model instanceof HasMedia, 404);
    }
}
