<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRedirectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('redirects.edit');
    }

    public function rules(): array
    {
        $redirect = $this->route('redirect');

        return [
            'from_path' => ['required', 'string', 'max:500', Rule::unique('redirects', 'from_path')->ignore($redirect)],
            'to_path' => ['required', 'string', 'max:500'],
            'status_code' => ['nullable', 'integer', 'in:301,302,307,308'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
