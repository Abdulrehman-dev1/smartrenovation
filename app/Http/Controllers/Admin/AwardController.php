<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAwardRequest;
use App\Http\Requests\Admin\UpdateAwardRequest;
use App\Models\Award;
use App\Support\AwardImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function __construct(private AwardImageStorage $images) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Award::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = Award::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('organization', 'like', "%{$search}%")
                    ->orWhere('year', 'like', "%{$search}%");
            });
        }

        if (in_array($filters['status'], ['draft', 'published'], true)) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Admin/Awards/Index', [
            'awards' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Award $award) => [
                    'id' => $award->id,
                    'title' => $award->title,
                    'organization' => $award->organization,
                    'year' => $award->year,
                    'status' => $award->status,
                    'cover_url' => $award->coverUrl(),
                ]),
            'filters' => $filters,
            'can' => [
                'view' => request()->user()->can('awards.view'),
                'create' => request()->user()->can('awards.create'),
                'edit' => request()->user()->can('awards.edit'),
                'delete' => request()->user()->can('awards.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Award::class);

        return Inertia::render('Admin/Awards/Create');
    }

    public function store(StoreAwardRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover'])->all();

        $award = Award::query()->create($data);

        if ($request->file('cover')) {
            $this->images->storeCover($award, $request->file('cover'));
        }

        return redirect()
            ->route('admin.awards.index')
            ->with('success', 'Award was successfully created.');
    }

    public function show(Award $award): Response
    {
        $this->authorize('view', $award);

        return Inertia::render('Admin/Awards/Show', [
            'award' => $this->present($award),
            'can' => [
                'edit' => request()->user()->can('awards.edit'),
                'delete' => request()->user()->can('awards.delete'),
            ],
        ]);
    }

    public function edit(Award $award): Response
    {
        $this->authorize('update', $award);

        return Inertia::render('Admin/Awards/Edit', [
            'award' => $this->present($award),
        ]);
    }

    public function update(UpdateAwardRequest $request, Award $award): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover'])->all();

        $award->update($data);

        if ($request->file('cover')) {
            $this->images->storeCover($award, $request->file('cover'));
        }

        return redirect()
            ->route('admin.awards.index')
            ->with('success', 'Award was successfully updated.');
    }

    public function destroy(Award $award): RedirectResponse
    {
        $this->authorize('delete', $award);

        $award->delete();

        return redirect()
            ->route('admin.awards.index')
            ->with('success', 'Award was successfully deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Award $award): array
    {
        return [
            'id' => $award->id,
            'title' => $award->title,
            'organization' => $award->organization,
            'year' => $award->year,
            'status' => $award->status,
            'created_at' => $award->created_at?->toIso8601String(),
            'updated_at' => $award->updated_at?->toIso8601String(),
            'cover' => $award->cover_image
                ? [
                    'path' => $award->cover_image,
                    'url' => $award->coverUrl(),
                    'name' => basename($award->cover_image),
                ]
                : null,
        ];
    }
}
