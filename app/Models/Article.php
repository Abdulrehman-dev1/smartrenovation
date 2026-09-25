<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Article extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'cover_image',
        'description',
        'status',
        'published_at',
        'meta_title',
        'meta_description',
        'canonical_url',
        'schema_json',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (Article $article) {
            app(\App\Support\ArticleImageStorage::class)->deleteAll($article);
        });
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function coverUrl(): ?string
    {
        return $this->pathToUrl($this->cover_image);
    }

    public function pathToUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
