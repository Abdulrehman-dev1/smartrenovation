<?php

namespace App\Http\Requests\Admin;

use App\Support\ProjectMedia;
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

        if ($this->isMethod('post') && $this->routeIs('admin.projects.images.promote-cover')) {
            return [
                'collection' => ['required', Rule::in(['gallery', 'gallery_hidden'])],
                'path' => ['required', 'string'],
            ];
        }

        $collection = $this->input('collection');
        $fileRules = $collection === 'cover'
            ? ProjectMedia::coverFileRules()
            : ProjectMedia::galleryFileRules();

        return [
            'collection' => ['required', Rule::in(['cover', 'gallery', 'gallery_hidden'])],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => array_merge(['required'], $fileRules),
            'posters' => ['nullable', 'array'],
            'posters.*' => array_merge(['nullable'], ProjectMedia::coverFileRules()),
            'rooms' => ['nullable', 'array'],
            'rooms.*' => ['string', Rule::in(ProjectTaxonomy::imageRooms())],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->isMethod('post') || ! $this->routeIs('*.projects.images.store')) {
                return;
            }

            $collection = $this->input('collection');
            if (! in_array($collection, ['gallery', 'gallery_hidden'], true)) {
                return;
            }

            $files = $this->file('files', []);
            if (! is_array($files)) {
                return;
            }

            $posters = $this->file('posters', []);
            if (! is_array($posters)) {
                $posters = [];
            }

            foreach (array_values($files) as $index => $file) {
                if (! $file) {
                    continue;
                }
                $name = strtolower((string) $file->getClientOriginalName());
                $ext = strtolower((string) ($file->getClientOriginalExtension() ?: $file->extension() ?: ''));
                $isVideo = str_starts_with((string) $file->getMimeType(), 'video/')
                    || in_array($ext, ProjectMedia::videoExtensions(), true)
                    || preg_match('/\.(mp4|webm)$/', $name);

                if ($isVideo && empty($posters[$index])) {
                    $validator->errors()->add(
                        "posters.$index",
                        'Please upload a cover image for this video.'
                    );
                }
            }
        });
    }
}
