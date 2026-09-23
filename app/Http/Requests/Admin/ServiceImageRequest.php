<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->can('services.create') || $user->can('services.edit'));
    }

    public function rules(): array
    {
        if ($this->isMethod('post') && $this->routeIs('admin.services.images.reorder')) {
            return [
                'ordered_paths' => ['required', 'array'],
                'ordered_paths.*' => ['string'],
            ];
        }

        return [
            'collection' => ['required', Rule::in(['cover', 'gallery'])],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,webp',
                'max:51200',
            ],
        ];
    }
}
