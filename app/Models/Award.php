<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Award extends Model
{
    protected $fillable = [
        'title',
        'organization',
        'year',
        'cover_image',
        'status',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Award $award) {
            app(\App\Support\AwardImageStorage::class)->deleteAll($award);
        });
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function coverUrl(): ?string
    {
        if (! $this->cover_image) {
            return null;
        }

        return Storage::disk('public')->url($this->cover_image);
    }
}
