<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pages.edit');
    }

    public function rules(): array
    {
        $page = $this->route('page');

        return [
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('pages', 'slug')->ignore($page)],
            'title' => ['required', 'string', 'max:255'],
            'sections' => ['nullable', 'array'],
        ];
    }
}
