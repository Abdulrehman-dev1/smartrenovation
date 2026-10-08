<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('reviews.create');
    }

    public function rules(): array
    {
        return [
            'star' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['required', 'string', 'max:5000'],
            'name' => ['required', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:160'],
            'from' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ];
    }
}
