<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreLocationRequest extends FormRequest
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
            $slug = Str::slug($name) ?: 'location';
        }

        $base = $slug;
        $i = 2;
        while (\App\Models\Location::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        $this->merge([
            'name' => $name,
            'slug' => $slug,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160', Rule::unique('locations', 'name')],
            'slug' => ['required', 'string', 'max:160', Rule::unique('locations', 'slug')],
        ];
    }
}
