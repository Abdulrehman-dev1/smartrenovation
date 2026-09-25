<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAwardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('awards.edit');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'organization' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'cover' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:51200'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('status') !== 'published') {
                return;
            }

            /** @var \App\Models\Award $award */
            $award = $this->route('award');
            if (! $award->cover_image && ! $this->file('cover')) {
                $validator->errors()->add('cover', 'A cover image is required when publishing.');
            }
        });
    }
}
