<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePressItemRequest;
use App\Http\Requests\Admin\UpdatePressItemRequest;
use App\Models\PressItem;
use App\Support\PressItemStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PressController extends Controller
{
    public function __construct(private PressItemStorage $storage) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PressItem::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = PressItem::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('outlet', 'like', "%{$search}%");
            });
        }

        if (in_array($filters['status'], ['draft', 'published'], true)) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Admin/Press/Index', [
            'items' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (PressItem $item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'outlet' => $item->outlet,
                    'status' => $item->status,
                    'cover_url' => $item->coverUrl(),
                    'has_pdf' => (bool) $item->pdf_path,
                    'has_href' => (bool) $item->href,
                ]),
            'filters' => $filters,
            'can' => [
                'view' => request()->user()->can('press.view'),
                'create' => request()->user()->can('press.create'),
                'edit' => request()->user()->can('press.edit'),
                'delete' => request()->user()->can('press.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', PressItem::class);

        return Inertia::render('Admin/Press/Create');
    }

    public function store(StorePressItemRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover', 'pdf'])->all();

        $item = PressItem::query()->create($data);

        if ($request->file('cover')) {
            $this->storage->storeCover($item, $request->file('cover'));
        }
        if ($request->file('pdf')) {
            $this->storage->storePdf($item, $request->file('pdf'));
        }

        return redirect()
            ->route('admin.press.index')
            ->with('success', 'Press item was successfully created.');
    }

    public function show(PressItem $press): Response
    {
        $this->authorize('view', $press);

        return Inertia::render('Admin/Press/Show', [
            'item' => $this->present($press),
            'can' => [
                'edit' => request()->user()->can('press.edit'),
                'delete' => request()->user()->can('press.delete'),
            ],
        ]);
    }

    public function edit(PressItem $press): Response
    {
        $this->authorize('update', $press);

        return Inertia::render('Admin/Press/Edit', [
            'item' => $this->present($press),
        ]);
    }

    public function update(UpdatePressItemRequest $request, PressItem $press): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover', 'pdf'])->all();

        $press->update($data);

        if ($request->file('cover')) {
            $this->storage->storeCover($press, $request->file('cover'));
        }
        if ($request->file('pdf')) {
            $this->storage->storePdf($press, $request->file('pdf'));
        }

        return redirect()
            ->route('admin.press.index')
            ->with('success', 'Press item was successfully updated.');
    }

    public function destroy(PressItem $press): RedirectResponse
    {
        $this->authorize('delete', $press);

        $press->delete();

        return redirect()
            ->route('admin.press.index')
            ->with('success', 'Press item was successfully deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PressItem $item): array
    {
        return [
            'id' => $item->id,
            'title' => $item->title,
            'outlet' => $item->outlet,
            'href' => $item->href,
            'status' => $item->status,
            'created_at' => $item->created_at?->toIso8601String(),
            'updated_at' => $item->updated_at?->toIso8601String(),
            'cover' => $item->cover_image
                ? [
                    'path' => $item->cover_image,
                    'url' => $item->coverUrl(),
                    'name' => basename($item->cover_image),
                ]
                : null,
            'pdf' => $item->pdf_path
                ? [
                    'path' => $item->pdf_path,
                    'url' => $item->pdfUrl(),
                    'name' => basename($item->pdf_path),
                ]
                : null,
            'link_url' => $item->linkUrl(),
        ];
    }
}
