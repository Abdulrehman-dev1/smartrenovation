<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AwardImageRequest;
use App\Models\Award;
use App\Support\AwardImageStorage;
use Illuminate\Http\JsonResponse;

class AwardImageController extends Controller
{
    public function __construct(private AwardImageStorage $images) {}

    public function store(AwardImageRequest $request, Award $award): JsonResponse
    {
        $this->authorizeAward();

        $file = $request->file('files')[0] ?? null;
        if (! $file) {
            return response()->json(['message' => 'No file provided.'], 422);
        }

        $this->images->storeCover($award, $file);
        $award->refresh();

        return response()->json([
            'message' => 'Cover uploaded.',
            'cover' => $award->cover_image
                ? [
                    'path' => $award->cover_image,
                    'url' => $award->coverUrl(),
                    'name' => basename($award->cover_image),
                ]
                : null,
        ]);
    }

    public function destroy(Award $award): JsonResponse
    {
        $this->authorizeAward();

        $this->images->clearCover($award);

        return response()->json(['message' => 'Cover deleted.']);
    }

    private function authorizeAward(): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('awards.edit') || $user->can('awards.create')),
            403
        );
    }
}
