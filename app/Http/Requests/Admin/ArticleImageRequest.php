<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticleImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->can('articles.create') || $user->can('articles.edit'));
    }

    public function rules(): array
    {
        return [
            'collection' => ['required', Rule::in(['cover'])],
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
