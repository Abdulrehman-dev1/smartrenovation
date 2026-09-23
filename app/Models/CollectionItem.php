<?php

namespace App\Models;

use App\Models\Concerns\HasCmsMedia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class CollectionItem extends Model implements HasMedia
{
    use HasCmsMedia;
    use InteractsWithMedia {
        HasCmsMedia::registerMediaConversions insteadof InteractsWithMedia;
    }

    protected $fillable = [
        'title',
        'tags',
        'room',
        'project_id',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile();
    }

    protected function conversionCollections(): array
    {
        return ['cover'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
