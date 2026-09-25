<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PressItem extends Model
{
    protected $fillable = [
        'title',
        'outlet',
        'href',
        'cover_image',
        'pdf_path',
        'status',
    ];

    protected static function booted(): void
    {
        static::deleting(function (PressItem $item) {
            app(\App\Support\PressItemStorage::class)->deleteAll($item);
        });
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function coverUrl(): ?string
    {
        return $this->pathToUrl($this->cover_image);
    }

    public function pdfUrl(): ?string
    {
        return $this->pathToUrl($this->pdf_path);
    }

    /**
     * Prefer uploaded PDF, else external href.
     */
    public function linkUrl(): ?string
    {
        return $this->pdfUrl() ?: ($this->href ?: null);
    }

    public function pathToUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
