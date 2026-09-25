<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PressItemImageRequest;
use App\Models\PressItem;
use App\Support\PressItemStorage;
use Illuminate\Http\JsonResponse;

class PressImageController extends Controller
{
    public function __construct(private PressItemStorage $storage) {}

    public function store(PressItemImageRequest $request, PressItem $press): JsonResponse
    {
        $this->authorizePress();

        $file = $request->file('files')[0] ?? null;
        if (! $file) {
            return response()->json(['message' => 'No file provided.'], 422);
        }

        $this->storage->storeCover($press, $file);
        $press->refresh();

        return response()->json([
            'message' => 'Cover uploaded.',
            'cover' => $press->cover_image
                ? [
                    'path' => $press->cover_image,
                    'url' => $press->coverUrl(),
                    'name' => basename($press->cover_image),
                ]
                : null,
        ]);
    }

    public function destroy(PressItem $press): JsonResponse
    {
        $this->authorizePress();

        $this->storage->clearCover($press);

        return response()->json(['message' => 'Cover deleted.']);
    }

    private function authorizePress(): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('press.edit') || $user->can('press.create')),
            403
        );
    }
}
