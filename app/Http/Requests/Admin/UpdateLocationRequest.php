<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        /** @var \App\Models\Location $location */
        $location = $this->route('location');
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));
        if ($slug === '') {
            $slug = $location->slug;
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
        $location = $this->route('location');

        return [
            'name' => ['required', 'string', 'max:160', Rule::unique('locations', 'name')->ignore($location)],
            'slug' => ['required', 'string', 'max:160', Rule::unique('locations', 'slug')->ignore($location)],
        ];
    }
}
