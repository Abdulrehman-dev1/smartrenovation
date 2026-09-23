<?php

namespace App\Http\Requests\Admin;

use App\Support\HtmlContent;
use App\Support\ProjectTaxonomy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('projects.create');
    }

    protected function prepareForValidation(): void
    {
        foreach (['category_id', 'location_id'] as $key) {
            if ($this->input($key) === '' || $this->input($key) === null) {
                $this->merge([$key => null]);
            }
        }

        if ($this->has('description')) {
            $this->merge([
                'description' => HtmlContent::sanitize($this->input('description')),
            ]);
        }

        if ($this->filled('schema_json') && is_string($this->input('schema_json'))) {
            $trimmed = trim($this->input('schema_json'));
            $this->merge(['schema_json' => $trimmed === '' ? null : $trimmed]);
        }
    }

    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:projects,slug'],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'studio' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'canonical_url' => ['nullable', 'string', 'max:2048'],
            'schema_json' => ['nullable', 'string', function ($attribute, $value, $fail) {
                if ($value === null || $value === '') {
                    return;
                }
                json_decode($value, true);
                if (json_last_error() !== JSON_ERROR_NONE || ! is_array(json_decode($value, true))) {
                    $fail('Schema must be valid JSON object.');
                }
            }],
            'cover' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
            'gallery_rooms' => ['nullable', 'array'],
            'gallery_rooms.*' => ['string', Rule::in(ProjectTaxonomy::imageRooms())],
            'gallery_hidden_files' => ['nullable', 'array'],
            'gallery_hidden_files.*' => ['file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
            'gallery_hidden_rooms' => ['nullable', 'array'],
            'gallery_hidden_rooms.*' => ['string', Rule::in(ProjectTaxonomy::imageRooms())],
        ];
    }
}
