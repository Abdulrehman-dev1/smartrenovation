<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CollectionItem;
use App\Support\MediaPresenter;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function __invoke(): Response
    {
        $items = CollectionItem::query()
            ->published()
            ->with(['media', 'project:id,title,slug'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (CollectionItem $item) => array_merge($item->only([
                'id', 'title', 'tags', 'room', 'sort_order',
            ]), [
                'project' => $item->project,
                'cover' => $item->getFirstMedia('cover')
                    ? MediaPresenter::toArray($item->getFirstMedia('cover'))
                    : null,
            ]));

        return Inertia::render('Public/Collection', [
            'items' => $items,
        ]);
    }
}
