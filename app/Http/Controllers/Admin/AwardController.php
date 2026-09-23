<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAwardRequest;
use App\Http\Requests\Admin\UpdateAwardRequest;
use App\Models\Award;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Award::class);

        return Inertia::render('Admin/Awards/Index', [
            'awards' => Award::query()->orderBy('sort_order')->latest()->paginate(20),
            'can' => [
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
        $award = Award::query()->create($request->validated());

        return redirect()
            ->route('admin.awards.edit', $award)
            ->with('success', 'Award was successfully created.');
    }

    public function edit(Award $award): Response
    {
        $this->authorize('update', $award);

        return Inertia::render('Admin/Awards/Edit', [
            'award' => $award,
        ]);
    }

    public function update(UpdateAwardRequest $request, Award $award): RedirectResponse
    {
        $award->update($request->validated());

        return redirect()
            ->route('admin.awards.edit', $award)
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
}
