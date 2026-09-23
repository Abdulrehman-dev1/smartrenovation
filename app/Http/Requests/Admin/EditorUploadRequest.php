<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class EditorUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user
            && (
                $user->can('projects.create')
                || $user->can('projects.edit')
                || $user->can('articles.create')
                || $user->can('articles.edit')
                || $user->can('services.edit')
            );
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,webp,gif', 'max:51200'],
        ];
    }
}
