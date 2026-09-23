<?php

namespace App\Http\Requests\Admin;

use App\Support\ProjectTaxonomy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->can('projects.create') || $user->can('projects.edit'));
    }

    public function rules(): array
    {
        if ($this->isMethod('post') && $this->routeIs('admin.projects.images.reorder')) {
            return [
                'collection' => ['required', Rule::in(['gallery', 'gallery_hidden'])],
                'ordered_paths' => ['required', 'array'],
                'ordered_paths.*' => ['string'],
            ];
        }

        if ($this->isMethod('post') && $this->routeIs('admin.projects.images.transfer')) {
            return [
                'from' => ['required', Rule::in(['gallery', 'gallery_hidden'])],
                'to' => ['required', Rule::in(['gallery', 'gallery_hidden']), 'different:from'],
                'paths' => ['required', 'array', 'min:1'],
                'paths.*' => ['string'],
            ];
        }

        if ($this->isMethod('post') && $this->routeIs('admin.projects.images.rooms')) {
            return [
                'collection' => ['required', Rule::in(['gallery', 'gallery_hidden'])],
                'updates' => ['required', 'array', 'min:1'],
                'updates.*.path' => ['required', 'string'],
                'updates.*.room' => ['required', 'string', Rule::in(ProjectTaxonomy::imageRooms())],
            ];
        }

        return [
            'collection' => ['required', Rule::in(['cover', 'gallery', 'gallery_hidden'])],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,webp',
                'max:51200',
            ],
            'rooms' => ['nullable', 'array'],
            'rooms.*' => ['string', Rule::in(ProjectTaxonomy::imageRooms())],
        ];
    }
}
