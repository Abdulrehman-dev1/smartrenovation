<?php

namespace App\Http\Requests\Admin;

use App\Support\HtmlContent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('articles.edit');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('body')) {
            $this->merge([
                'body' => HtmlContent::sanitize($this->input('body')),
            ]);
        }
    }

    public function rules(): array
    {
        $article = $this->route('article');

        return [
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('articles', 'slug')->ignore($article)],
            'title' => ['required', 'string', 'max:255'],
            'published_on' => ['nullable', 'date'],
            'excerpt' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
        ];
    }
}
