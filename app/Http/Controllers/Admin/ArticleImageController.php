<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ArticleImageRequest;
use App\Models\Article;
use App\Support\ArticleImageStorage;
use Illuminate\Http\JsonResponse;

class ArticleImageController extends Controller
{
    public function __construct(private ArticleImageStorage $images) {}

    public function store(ArticleImageRequest $request, Article $article): JsonResponse
    {
        $this->authorizeArticle();

        $file = $request->file('files')[0] ?? null;
        if (! $file) {
            return response()->json(['message' => 'No file provided.'], 422);
        }

        $path = $this->images->storeCover($article, $file);
        $article->refresh();

        return response()->json([
            'message' => 'Cover uploaded.',
            'cover' => $article->cover_image
                ? [
                    'path' => $article->cover_image,
                    'url' => $article->coverUrl(),
                    'name' => basename($article->cover_image),
                ]
                : null,
            'path' => $path,
        ]);
    }

    public function destroy(Article $article): JsonResponse
    {
        $this->authorizeArticle();

        $this->images->clearCover($article);
        $article->refresh();

        return response()->json([
            'message' => 'Image deleted.',
        ]);
    }

    private function authorizeArticle(): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('articles.edit') || $user->can('articles.create')),
            403
        );
    }
}
