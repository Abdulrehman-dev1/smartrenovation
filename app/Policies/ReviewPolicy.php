<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('reviews.viewAny');
    }

    public function view(User $user, Review $review): bool
    {
        return $user->can('reviews.view');
    }

    public function create(User $user): bool
    {
        return $user->can('reviews.create');
    }

    public function update(User $user, Review $review): bool
    {
        return $user->can('reviews.edit');
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->can('reviews.delete');
    }
}
