<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreArticleRequest;
use App\Http\Requests\Admin\UpdateArticleRequest;
use App\Models\Article;
use App\Support\MediaPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Article::class);

        return Inertia::render('Admin/Articles/Index', [
            'articles' => Article::query()->latest()->paginate(20),
            'can' => [
                'create' => request()->user()->can('articles.create'),
                'edit' => request()->user()->can('articles.edit'),
                'delete' => request()->user()->can('articles.delete'),
            ],
        ]);
    }

    public function create(): RedirectResponse
    {
        $this->authorize('create', Article::class);

        $article = Article::query()->create([
            'title' => 'Untitled article',
            'slug' => 'draft-'.Str::lower((string) Str::ulid()),
            'status' => 'draft',
        ]);

        return redirect()
            ->route('admin.articles.edit', $article)
            ->with('success', 'Draft ready — add details and cover image below, then save.');
    }

    public function store(StoreArticleRequest $request): RedirectResponse
    {
        $article = Article::query()->create($request->validated());

        return redirect()
            ->route('admin.articles.edit', $article)
            ->with('success', 'Article was successfully created.');
    }

    public function edit(Article $article): Response
    {
        $this->authorize('update', $article);

        $article->load('media');

        return Inertia::render('Admin/Articles/Edit', [
            'isNew' => str_starts_with($article->slug, 'draft-') || $article->title === 'Untitled article',
            'article' => array_merge($article->toArray(), [
                'cover' => $article->getFirstMedia('cover')
                    ? MediaPresenter::toArray($article->getFirstMedia('cover'))
                    : null,
            ]),
        ]);
    }

    public function update(UpdateArticleRequest $request, Article $article): RedirectResponse
    {
        $article->update($request->validated());

        return redirect()
            ->route('admin.articles.edit', $article)
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
}
