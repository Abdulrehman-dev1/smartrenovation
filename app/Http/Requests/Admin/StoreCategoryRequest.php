<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));
        if ($slug === '' && $name !== '') {
            $slug = Str::slug($name);
        }
        $typeLabel = trim((string) $this->input('type_label', ''));
        if ($typeLabel === '' && $name !== '') {
            $typeLabel = Str::singular($name);
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
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('categories', 'slug')],
            'type_label' => ['nullable', 'string', 'max:120'],
        ];
    }
}
