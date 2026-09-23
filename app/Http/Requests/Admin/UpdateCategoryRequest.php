<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        /** @var \App\Models\Category $category */
        $category = $this->route('category');
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));
        if ($slug === '' && $name !== '') {
            $slug = Str::slug($name);
        }

        $typeLabel = trim((string) $this->input('type_label', ''));
        if ($typeLabel === '') {
            $typeLabel = $category->type_label ?: Str::singular($name);
        }

        $this->merge([
            'name' => $name,
            'slug' => $slug,
            'type_label' => $typeLabel !== '' ? $typeLabel : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'alpha_dash',
                Rule::unique('categories', 'slug')->ignore($category),
            ],
            'type_label' => ['nullable', 'string', 'max:120'],
        ];
    }
}
