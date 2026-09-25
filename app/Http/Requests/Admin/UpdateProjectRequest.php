<?php

namespace App\Http\Requests\Admin;

use App\Support\HtmlContent;
use App\Support\ProjectTaxonomy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('projects.edit');
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

        if ($this->has('schema_json') && is_string($this->input('schema_json'))) {
            $trimmed = trim($this->input('schema_json'));
            $this->merge(['schema_json' => $trimmed === '' ? null : $trimmed]);
        }

        if ($this->has('collection_images') && ! is_array($this->input('collection_images'))) {
            $this->merge(['collection_images' => []]);
        }

        if (is_array($this->input('collection_images'))) {
            $normalized = [];
            foreach ($this->input('collection_images') as $item) {
                if (! is_array($item)) {
                    continue;
                }
                if (isset($item['path']) && is_string($item['path'])) {
                    $item['path'] = self::normalizeStoragePath($item['path']);
                }
                // Drop undefined/empty ar so validation stays clean.
                if (array_key_exists('ar', $item) && ($item['ar'] === null || $item['ar'] === '')) {
                    unset($item['ar']);
                }
                $normalized[] = $item;
            }
            $this->merge(['collection_images' => $normalized]);
        }
    }

    /**
     * Accept relative disk paths or /storage/... / full URLs and return disk-relative path.
     */
    private static function normalizeStoragePath(string $path): string
    {
        $path = trim($path);
        if ($path === '') {
            return $path;
        }

        if (preg_match('#^https?://#i', $path)) {
            $path = parse_url($path, PHP_URL_PATH) ?: $path;
        }

        $path = str_replace('\\', '/', $path);
        if (str_starts_with($path, '/storage/')) {
            $path = substr($path, strlen('/storage/'));
        } elseif (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        return ltrim($path, '/');
    }

    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('projects', 'slug')->ignore($project)],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'studio' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999999'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'canonical_url' => ['nullable', 'string', 'max:2048'],
            'schema_json' => ['nullable', 'string', function ($attribute, $value, $fail) {
                if ($value === null || $value === '') {
                    return;
                }
                $decoded = json_decode($value, true);
                if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
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
            'collection_images' => ['nullable', 'array'],
            'collection_images.*.path' => ['required', 'string'],
            'collection_images.*.style' => ['required', 'string', Rule::in(ProjectTaxonomy::collectionStyles())],
            'collection_images.*.ar' => ['nullable', 'numeric', 'gt:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var \App\Models\Project|null $project */
            $project = $this->route('project');
            if (! $project) {
                return;
            }

            // Re-read from DB so AJAX image changes are reflected.
            $project->refresh();

            $rawImages = $this->input('collection_images', []);
            if (! is_array($rawImages)) {
                $rawImages = [];
            }

            $allowed = array_flip($project->collectionCandidatePaths());
            foreach ($rawImages as $index => $item) {
                $normalized = \App\Models\Project::normalizeCollectionImageItem($item);
                if (! $normalized) {
                    $validator->errors()->add("collection_images.{$index}", 'Invalid collection image.');
                    continue;
                }
                if (! isset($allowed[$normalized['path']])) {
                    $validator->errors()->add(
                        "collection_images.{$index}.path",
                        'Image must be the project cover or gallery.'
                    );
                }
            }
        });
    }
}
