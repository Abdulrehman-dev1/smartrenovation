<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Models\Service;
use App\Support\ServiceImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function __construct(private ServiceImageStorage $images) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Service::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => trim((string) $request->string('status')),
        ];

        $query = Service::query()->latest();

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

        return Inertia::render('Admin/Services/Index', [
            'services' => $query
                ->paginate(12)
                ->withQueryString()
                ->through(fn (Service $service) => [
                    'id' => $service->id,
                    'title' => $service->title,
                    'subtitle' => $service->subtitle,
                    'slug' => $service->slug,
                    'status' => $service->status,
                    'cover_url' => $service->coverUrl(),
                ]),
            'filters' => $filters,
            'can' => [
                'view' => request()->user()->can('services.view'),
                'create' => request()->user()->can('services.create'),
                'edit' => request()->user()->can('services.edit'),
                'delete' => request()->user()->can('services.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Service::class);

        return Inertia::render('Admin/Services/Create');
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover', 'gallery'])->all();

        $service = Service::query()->create($data);

        if ($request->file('cover')) {
            $this->images->storeCover($service, $request->file('cover'));
        }
        if ($request->file('gallery')) {
            $this->images->appendGallery($service, $request->file('gallery'));
        }

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service was successfully created.');
    }

    public function show(Service $service): Response
    {
        $this->authorize('view', $service);

        return Inertia::render('Admin/Services/Show', [
            'service' => $this->present($service),
            'can' => [
                'edit' => request()->user()->can('services.edit'),
                'delete' => request()->user()->can('services.delete'),
            ],
            'publicUrl' => url('/services/'.$service->slug),
        ]);
    }

    public function edit(Service $service): Response
    {
        $this->authorize('update', $service);

        return Inertia::render('Admin/Services/Edit', [
            'service' => $this->present($service),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $data = collect($request->validated())->except(['cover', 'gallery'])->all();

        $service->update($data);

        if ($request->file('cover')) {
            $this->images->storeCover($service, $request->file('cover'));
        }
        if ($request->file('gallery')) {
            $this->images->appendGallery($service, $request->file('gallery'));
        }

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service was successfully updated.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $this->authorize('delete', $service);

        $service->delete();

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service was successfully deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Service $service): array
    {
        return array_merge($service->toArray(), [
            'cover' => $service->cover_image
                ? [
                    'path' => $service->cover_image,
                    'url' => $service->coverUrl(),
                    'name' => basename($service->cover_image),
                ]
                : null,
            'gallery' => $service->presentGallery(),
        ]);
    }
}
