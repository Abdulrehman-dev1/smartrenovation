<?php

namespace App\Models;

use App\Support\ProjectTaxonomy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category_id',
        'location_id',
        'studio',
        'rooms',
        'subtitle',
        'description',
        'cover_image',
        'gallery_images',
        'gallery_hidden',
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
            'rooms' => 'array',
            'gallery_images' => 'array',
            'gallery_hidden' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (Project $project) {
            app(\App\Support\ProjectImageStorage::class)->deleteAll($project);
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function collectionItems(): HasMany
    {
        return $this->hasMany(CollectionItem::class);
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
     * @return list<string>
     */
    public function galleryUrls(): array
    {
        return collect($this->normalizedGallery('gallery_images'))
            ->map(fn (array $item) => $this->pathToUrl($item['path']))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return list<array{path: string, url: string, name: string, room: string}>
     */
    public function presentGallery(string $field = 'gallery_images'): array
    {
        return collect($this->normalizedGallery($field))
            ->map(fn (array $item) => [
                'path' => $item['path'],
                'url' => $this->pathToUrl($item['path']) ?? '',
                'name' => basename($item['path']),
                'room' => $item['room'],
            ])
            ->values()
            ->all();
    }

    /**
     * Normalize gallery JSON to list of {path, room}.
     *
     * @return list<array{path: string, room: string}>
     */
    public function normalizedGallery(string $field = 'gallery_images'): array
    {
        $allowed = array_flip(ProjectTaxonomy::imageRooms());
        $out = [];

        foreach ($this->{$field} ?? [] as $item) {
            $normalized = self::normalizeGalleryItem($item, $allowed);
            if ($normalized) {
                $out[] = $normalized;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, int>|null  $allowed
     * @return array{path: string, room: string}|null
     */
    public static function normalizeGalleryItem(mixed $item, ?array $allowed = null): ?array
    {
        $allowed ??= array_flip(ProjectTaxonomy::imageRooms());

        if (is_string($item) && $item !== '') {
            return ['path' => $item, 'room' => ProjectTaxonomy::OTHER_ROOM];
        }

        if (! is_array($item)) {
            return null;
        }

        $path = $item['path'] ?? null;
        if (! is_string($path) || $path === '') {
            return null;
        }

        $room = $item['room'] ?? ProjectTaxonomy::OTHER_ROOM;
        if (! is_string($room) || ! isset($allowed[$room])) {
            $room = ProjectTaxonomy::OTHER_ROOM;
        }

        return ['path' => $path, 'room' => $room];
    }

    public function syncRoomsFromGallery(): void
    {
        $rooms = collect($this->normalizedGallery('gallery_images'))
            ->pluck('room')
            ->filter(fn (string $room) => $room !== ProjectTaxonomy::OTHER_ROOM)
            ->unique()
            ->values()
            ->all();

        $this->forceFill(['rooms' => $rooms])->save();
    }

    public function pathToUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
};
