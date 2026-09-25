<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePressItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('press.create');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'outlet' => ['required', 'string', 'max:255'],
            'href' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'cover' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('status') !== 'published') {
                return;
            }

            if (! $this->file('cover')) {
                $validator->errors()->add('cover', 'A cover image is required when publishing.');
            }

            $hasHref = filled($this->input('href'));
            $hasPdf = (bool) $this->file('pdf');
            if (! $hasHref && ! $hasPdf) {
                $validator->errors()->add('href', 'Provide an external URL or upload a PDF when publishing.');
            }
        });
    }
}
