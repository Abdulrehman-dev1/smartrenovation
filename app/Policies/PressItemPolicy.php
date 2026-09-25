<?php

namespace App\Policies;

use App\Models\PressItem;
use App\Models\User;

class PressItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('press.viewAny');
    }

    public function view(User $user, PressItem $pressItem): bool
    {
        return $user->can('press.view');
    }

    public function create(User $user): bool
    {
        return $user->can('press.create');
    }

    public function update(User $user, PressItem $pressItem): bool
    {
        return $user->can('press.edit');
    }

    public function delete(User $user, PressItem $pressItem): bool
    {
        return $user->can('press.delete');
    }
}
