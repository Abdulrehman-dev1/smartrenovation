<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorizeTaxonomy($request->user());

        $category = Category::query()->create($request->validated());

        return response()->json([
            'category' => $this->present($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorizeTaxonomy($request->user());

        $category->update($request->validated());

        return response()->json([
            'category' => $this->present($category->fresh()),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorizeTaxonomy(request()->user());

        $category->delete();

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
     * @return array{id: int, value: string, label: string, type_label: string|null}
     */
    private function present(Category $category): array
    {
        return [
            'id' => $category->id,
            'value' => $category->slug,
            'label' => $category->name,
            'type_label' => $category->type_label,
        ];
    }
}
