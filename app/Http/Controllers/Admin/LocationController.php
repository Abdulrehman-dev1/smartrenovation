<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLocationRequest;
use App\Http\Requests\Admin\UpdateLocationRequest;
use App\Models\Location;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $this->authorizeTaxonomy($request->user());

        $location = Location::query()->create($request->validated());

        return response()->json([
            'location' => $this->present($location),
        ], 201);
    }

    public function update(UpdateLocationRequest $request, Location $location): JsonResponse
    {
        $this->authorizeTaxonomy($request->user());

        $location->update($request->validated());

        return response()->json([
            'location' => $this->present($location->fresh()),
        ]);
    }

    public function destroy(Location $location): JsonResponse
    {
        $this->authorizeTaxonomy(request()->user());

        $location->delete();

        return response()->json(['ok' => true]);
    }

    private function authorizeTaxonomy($user): void
    {
        abort_unless(
            $user && ($user->can('projects.create') || $user->can('projects.edit')),
            403
        );
    }

    /**
     * @return array{id: int, name: string}
     */
    private function present(Location $location): array
    {
        return [
            'id' => $location->id,
            'name' => $location->name,
        ];
    }
}
