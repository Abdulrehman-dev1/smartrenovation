<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DestroyMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user
            && (
                $user->can('projects.edit')
                || $user->can('services.edit')
                || $user->can('articles.edit')
                || $user->can('collection_items.edit')
            );
    }

    public function rules(): array
    {
        return [];
    }
}
