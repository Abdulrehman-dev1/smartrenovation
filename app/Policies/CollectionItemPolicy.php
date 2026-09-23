<?php

namespace App\Policies;

use App\Models\CollectionItem;
use App\Models\User;

class CollectionItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('collection_items.viewAny');
    }

    public function view(User $user, CollectionItem $collectionItem): bool
    {
        return $user->can('collection_items.view');
    }

    public function create(User $user): bool
    {
        return $user->can('collection_items.create');
    }

    public function update(User $user, CollectionItem $collectionItem): bool
    {
        return $user->can('collection_items.edit');
    }

    public function delete(User $user, CollectionItem $collectionItem): bool
    {
        return $user->can('collection_items.delete');
    }
}
