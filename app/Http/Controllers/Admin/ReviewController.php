<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreReviewRequest;
use App\Http\Requests\Admin\UpdateReviewRequest;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Review::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = Review::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('review', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('from', 'like', "%{$search}%");
            });
        }

        if (in_array($filters['status'], ['draft', 'published'], true)) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Review $review) => $this->present($review)),
            'filters' => $filters,
            'can' => [
                'view' => request()->user()->can('reviews.view'),
                'create' => request()->user()->can('reviews.create'),
                'edit' => request()->user()->can('reviews.edit'),
                'delete' => request()->user()->can('reviews.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Review::class);

        return Inertia::render('Admin/Reviews/Create');
    }

    public function store(StoreReviewRequest $request): RedirectResponse
    {
        Review::query()->create($request->validated());

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review was successfully created.');
    }

    public function show(Review $review): Response
    {
        $this->authorize('view', $review);

        return Inertia::render('Admin/Reviews/Show', [
            'review' => $this->present($review),
            'can' => [
                'edit' => request()->user()->can('reviews.edit'),
                'delete' => request()->user()->can('reviews.delete'),
            ],
        ]);
    }

    public function edit(Review $review): Response
    {
        $this->authorize('update', $review);

        return Inertia::render('Admin/Reviews/Edit', [
            'review' => $this->present($review),
        ]);
    }

    public function update(UpdateReviewRequest $request, Review $review): RedirectResponse
    {
        $review->update($request->validated());

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review was successfully updated.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $this->authorize('delete', $review);

        $review->delete();

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review was successfully deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Review $review): array
    {
        return [
            'id' => $review->id,
            'star' => $review->star,
            'review' => $review->review,
            'name' => $review->name,
            'location' => $review->location,
            'from' => $review->from,
            'status' => $review->status,
            'created_at' => $review->created_at?->toIso8601String(),
            'updated_at' => $review->updated_at?->toIso8601String(),
        ];
    }
}
