<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Page::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
        ];

        $query = Page::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $query->paginate(20)->withQueryString(),
            'filters' => $filters,
            'can' => [
                'create' => request()->user()->can('pages.create'),
                'edit' => request()->user()->can('pages.edit'),
                'delete' => request()->user()->can('pages.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Page::class);

        return Inertia::render('Admin/Pages/Create');
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $page = Page::query()->create($request->validated());

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page was successfully created.');
    }

    public function edit(Page $page): Response
    {
        $this->authorize('update', $page);

        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page,
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $page->update($request->validated());

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page was successfully updated.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $this->authorize('delete', $page);

        $page->delete();

        return redirect()
            ->route('admin.pages.index')
            ->with('success', 'Page was successfully deleted.');
    }
}
