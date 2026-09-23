<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'short_description',
        'description',
        'cover_image',
        'gallery_images',
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
            'gallery_images' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (Service $service) {
            app(\App\Support\ServiceImageStorage::class)->deleteAll($service);
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

    /**
     * @return list<array{path: string, url: string, name: string}>
     */
    public function presentGallery(): array
    {
        return collect($this->normalizedGallery())
            ->map(fn (array $item) => [
                'path' => $item['path'],
                'url' => $this->pathToUrl($item['path']) ?? '',
                'name' => basename($item['path']),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{path: string}>
     */
    public function normalizedGallery(): array
    {
        $out = [];

        foreach ($this->gallery_images ?? [] as $item) {
            if (is_string($item) && $item !== '') {
                $out[] = ['path' => $item];

                continue;
            }
            if (! is_array($item)) {
                continue;
            }
            $path = $item['path'] ?? null;
            if (is_string($path) && $path !== '') {
                $out[] = ['path' => $path];
            }
        }

        return $out;
    }

    public function pathToUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
