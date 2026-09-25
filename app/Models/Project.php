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
        'collection_style',
        'collection_images',
        'status',
        'sort_order',
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
            'sort_order' => 'integer',
            'rooms' => 'array',
            'gallery_images' => 'array',
            'gallery_hidden' => 'array',
            'collection_images' => 'array',
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

    /**
     * Cover + gallery (+ hidden) paths eligible for the Collection board.
     *
     * @return list<string>
     */
    public function collectionCandidatePaths(): array
    {
        $paths = [];

        if (is_string($this->cover_image) && $this->cover_image !== '') {
            $paths[] = $this->cover_image;
        }

        foreach ($this->normalizedGallery('gallery_images') as $item) {
            $paths[] = $item['path'];
        }

        foreach ($this->normalizedGallery('gallery_hidden') as $item) {
            $paths[] = $item['path'];
        }

        return array_values(array_unique($paths));
    }

    /**
     * @return list<array{path: string, url: string, name: string, source: string}>
     */
    public function presentCollectionCandidates(): array
    {
        $out = [];

        if (is_string($this->cover_image) && $this->cover_image !== '') {
            $out[] = [
                'path' => $this->cover_image,
                'url' => $this->pathToUrl($this->cover_image) ?? '',
                'name' => basename($this->cover_image),
                'source' => 'cover',
            ];
        }

        foreach ($this->normalizedGallery('gallery_images') as $index => $item) {
            $out[] = [
                'path' => $item['path'],
                'url' => $this->pathToUrl($item['path']) ?? '',
                'name' => basename($item['path']),
                'source' => 'gallery:'.$index,
            ];
        }

        foreach ($this->normalizedGallery('gallery_hidden') as $index => $item) {
            $out[] = [
                'path' => $item['path'],
                'url' => $this->pathToUrl($item['path']) ?? '',
                'name' => basename($item['path']),
                'source' => 'hidden:'.$index,
            ];
        }

        return $out;
    }

    /**
     * @return list<array{path: string, url: string, name: string, style: string, ar: float}>
     */
    public function presentCollectionImages(): array
    {
        return collect($this->normalizedCollectionImages())
            ->map(fn (array $item) => [
                'path' => $item['path'],
                'url' => $this->pathToUrl($item['path']) ?? '',
                'name' => basename($item['path']),
                'style' => $item['style'],
                'ar' => $item['ar'],
            ])
            ->filter(fn (array $item) => $item['url'] !== '')
            ->values()
            ->all();
    }

    /**
     * Normalize collection_images JSON to list of {path, ar, style}.
     *
     * @return list<array{path: string, ar: float, style: string}>
     */
    public function normalizedCollectionImages(): array
    {
        $allowed = array_flip($this->collectionCandidatePaths());
        $styles = array_flip(ProjectTaxonomy::collectionStyles());
        $out = [];

        foreach ($this->collection_images ?? [] as $item) {
            $normalized = self::normalizeCollectionImageItem($item, $this->collection_style);
            if (! $normalized || ! isset($allowed[$normalized['path']])) {
                continue;
            }
            if (! isset($styles[$normalized['style']])) {
                continue;
            }
            $out[] = $normalized;
        }

        return $out;
    }

    /**
     * @return array{path: string, ar: float, style: string}|null
     */
    public static function normalizeCollectionImageItem(mixed $item, ?string $fallbackStyle = null): ?array
    {
        if (is_string($item) && $item !== '') {
            $style = is_string($fallbackStyle) && $fallbackStyle !== ''
                ? $fallbackStyle
                : null;
            if ($style === null || ! in_array($style, ProjectTaxonomy::collectionStyles(), true)) {
                return null;
            }

            return [
                'path' => $item,
                'ar' => ProjectTaxonomy::DEFAULT_COLLECTION_AR,
                'style' => $style,
            ];
        }

        if (! is_array($item)) {
            return null;
        }

        $path = $item['path'] ?? null;
        if (! is_string($path) || $path === '') {
            return null;
        }

        $style = $item['style'] ?? $fallbackStyle;
        if (! is_string($style) || ! in_array($style, ProjectTaxonomy::collectionStyles(), true)) {
            return null;
        }

        $ar = $item['ar'] ?? ProjectTaxonomy::DEFAULT_COLLECTION_AR;
        if (! is_numeric($ar) || (float) $ar <= 0) {
            $ar = ProjectTaxonomy::DEFAULT_COLLECTION_AR;
        }

        return ['path' => $path, 'ar' => (float) $ar, 'style' => $style];
    }

    /**
     * Keep collection_images in sync with cover/gallery; sync collection_style from images.
     */
    public function pruneCollectionImages(): void
    {
        $images = $this->normalizedCollectionImages();

        if ($images === []) {
            $this->forceFill([
                'collection_style' => null,
                'collection_images' => null,
            ])->save();

            return;
        }

        $this->forceFill([
            'collection_style' => $images[0]['style'],
            'collection_images' => $images,
        ])->save();
    }

    /**
     * Resolve create-form entries [{key, style}] to collection_images after upload.
     *
     * @param  list<array{key?: string, style?: string}|mixed>  $entries
     * @return list<array{path: string, ar: float, style: string}>
     */
    public function resolveCollectionEntries(array $entries): array
    {
        $gallery = $this->normalizedGallery('gallery_images');
        $out = [];
        $seen = [];

        foreach ($entries as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $key = $entry['key'] ?? null;
            $style = $entry['style'] ?? null;
            if (! is_string($key) || $key === '' || ! is_string($style)) {
                continue;
            }
            if (! in_array($style, ProjectTaxonomy::collectionStyles(), true)) {
                continue;
            }

            $path = null;
            if ($key === 'cover') {
                $path = is_string($this->cover_image) && $this->cover_image !== ''
                    ? $this->cover_image
                    : null;
            } elseif (preg_match('/^gallery:(\d+)$/', $key, $m)) {
                $index = (int) $m[1];
                $path = $gallery[$index]['path'] ?? null;
            }

            if ($path === null || isset($seen[$path])) {
                continue;
            }

            $seen[$path] = true;
            $out[] = [
                'path' => $path,
                'ar' => ProjectTaxonomy::DEFAULT_COLLECTION_AR,
                'style' => $style,
            ];
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
