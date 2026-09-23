<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        return $user->can('projects.create')
            || $user->can('projects.edit')
            || $user->can('services.edit')
            || $user->can('articles.edit')
            || $user->can('collection_items.edit');
    }

    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
            'collection' => ['nullable', 'string', Rule::in(['cover', 'gallery', 'gallery_hidden'])],
            'model_type' => ['nullable', 'string', Rule::in(['service', 'article', 'collection_item'])],
            'model_id' => ['nullable', 'integer'],
        ];
    }
}
