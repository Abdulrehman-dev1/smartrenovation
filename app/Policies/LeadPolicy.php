<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('leads.viewAny');
    }

    public function view(User $user, Lead $lead): bool
    {
        return $user->can('leads.view');
    }

    public function delete(User $user, Lead $lead): bool
    {
        return $user->can('leads.delete');
    }
}
