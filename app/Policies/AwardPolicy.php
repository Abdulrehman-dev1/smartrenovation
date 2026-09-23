<?php

namespace App\Policies;

use App\Models\Award;
use App\Models\User;

class AwardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('awards.viewAny');
    }

    public function view(User $user, Award $award): bool
    {
        return $user->can('awards.view');
    }

    public function create(User $user): bool
    {
        return $user->can('awards.create');
    }

    public function update(User $user, Award $award): bool
    {
        return $user->can('awards.edit');
    }

    public function delete(User $user, Award $award): bool
    {
        return $user->can('awards.delete');
    }
}
