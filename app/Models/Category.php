<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'type_label',
    ];

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
