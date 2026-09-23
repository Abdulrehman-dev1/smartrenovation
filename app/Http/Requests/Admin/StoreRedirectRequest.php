<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRedirectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('redirects.create');
    }

    public function rules(): array
    {
        return [
            'from_path' => ['required', 'string', 'max:500', 'unique:redirects,from_path'],
            'to_path' => ['required', 'string', 'max:500'],
            'status_code' => ['nullable', 'integer', 'in:301,302,307,308'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
