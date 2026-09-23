<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCollectionItemRequest;
use App\Http\Requests\Admin\UpdateCollectionItemRequest;
use App\Models\CollectionItem;
use App\Models\Project;
use App\Support\MediaPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CollectionItemController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', CollectionItem::class);

        return Inertia::render('Admin/CollectionItems/Index', [
            'collectionItems' => CollectionItem::query()
                ->with('project:id,name')
                ->orderBy('sort_order')
                ->latest()
                ->paginate(20),
            'can' => [
                'create' => request()->user()->can('collection_items.create'),
                'edit' => request()->user()->can('collection_items.edit'),
                'delete' => request()->user()->can('collection_items.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', CollectionItem::class);

        return Inertia::render('Admin/CollectionItems/Create', [
            'projects' => Project::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreCollectionItemRequest $request): RedirectResponse
    {
        $item = CollectionItem::query()->create($request->validated());

        return redirect()
            ->route('admin.collection-items.edit', $item)
            ->with('success', 'Collection item was successfully created.');
    }

    public function edit(CollectionItem $collectionItem): Response
    {
        $this->authorize('update', $collectionItem);

        $collectionItem->load('media');

        return Inertia::render('Admin/CollectionItems/Edit', [
            'collectionItem' => array_merge($collectionItem->toArray(), [
                'cover' => $collectionItem->getFirstMedia('cover')
                    ? MediaPresenter::toArray($collectionItem->getFirstMedia('cover'))
                    : null,
            ]),
            'projects' => Project::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCollectionItemRequest $request, CollectionItem $collectionItem): RedirectResponse
    {
        $collectionItem->update($request->validated());

        return redirect()
            ->route('admin.collection-items.edit', $collectionItem)
            ->with('success', 'Collection item was successfully updated.');
    }

    public function destroy(CollectionItem $collectionItem): RedirectResponse
    {
        $this->authorize('delete', $collectionItem);

        $collectionItem->delete();

        return redirect()
            ->route('admin.collection-items.index')
            ->with('success', 'Collection item was successfully deleted.');
    }
}
