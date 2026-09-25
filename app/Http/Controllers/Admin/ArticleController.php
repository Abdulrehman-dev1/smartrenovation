<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreArticleRequest;
use App\Http\Requests\Admin\UpdateArticleRequest;
use App\Models\Article;
use App\Support\ArticleImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function __construct(private ArticleImageStorage $images) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Article::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = Article::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        if (in_array($filters['status'], ['draft', 'published'], true)) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Article $article) => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'subtitle' => $article->subtitle,
                    'slug' => $article->slug,
                    'status' => $article->status,
                    'published_at' => $article->published_at?->toIso8601String(),
                    'cover_url' => $article->coverUrl(),
                ]),
            'filters' => $filters,
            'can' => [
                'view' => request()->user()->can('articles.view'),
                'create' => request()->user()->can('articles.create'),
                'edit' => request()->user()->can('articles.edit'),
                'delete' => request()->user()->can('articles.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Article::class);

        return Inertia::render('Admin/Articles/Create');
    }

    public function store(StoreArticleRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover'])->all();

        if (($data['status'] ?? '') === 'published') {
            $data['published_at'] = now();
        }

        $article = Article::query()->create($data);

        if ($request->file('cover')) {
            $this->images->storeCover($article, $request->file('cover'));
        }

        return redirect()
            ->route('admin.articles.index')
            ->with('success', 'Article was successfully created.');
    }

    public function show(Article $article): Response
    {
        $this->authorize('view', $article);

        return Inertia::render('Admin/Articles/Show', [
            'article' => array_merge($this->present($article), [
                'published_at' => $article->published_at?->toIso8601String(),
            ]),
            'can' => [
                'edit' => request()->user()->can('articles.edit'),
                'delete' => request()->user()->can('articles.delete'),
            ],
            'publicUrl' => url('/media/'.$article->slug),
        ]);
    }

    public function edit(Article $article): Response
    {
        $this->authorize('update', $article);

        return Inertia::render('Admin/Articles/Edit', [
            'article' => $this->present($article),
        ]);
    }

    public function update(UpdateArticleRequest $request, Article $article): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover'])->all();

        if (($data['status'] ?? '') === 'published' && ! $article->published_at) {
            $data['published_at'] = now();
        }

        $article->update($data);

        if ($request->file('cover')) {
            $this->images->storeCover($article, $request->file('cover'));
        }

        return redirect()
            ->route('admin.articles.index')
            ->with('success', 'Article was successfully updated.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        $this->authorize('delete', $article);

        $article->delete();

        return redirect()
            ->route('admin.articles.index')
            ->with('success', 'Article was successfully deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Article $article): array
    {
        return array_merge($article->toArray(), [
            'cover' => $article->cover_image
                ? [
                    'path' => $article->cover_image,
                    'url' => $article->coverUrl(),
                    'name' => basename($article->cover_image),
                ]
                : null,
            'created_at' => $article->created_at?->toIso8601String(),
            'updated_at' => $article->updated_at?->toIso8601String(),
            'published_at' => $article->published_at?->toIso8601String(),
        ]);
    }
}
