<?php

namespace App\Models\Concerns;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasCmsMedia
{
    public function registerMediaConversions(?Media $media = null): void
    {
        // Queued by default (config media-library.queue_conversions_by_default).
        // Caps longest edge + JPEG quality so 25MB+ originals become web-ready.
        $this->addMediaConversion('thumb')
            ->width(400)
            ->quality(80)
            ->performOnCollections(...$this->conversionCollections());

        $this->addMediaConversion('card')
            ->width(800)
            ->quality(82)
            ->performOnCollections(...$this->conversionCollections());

        $this->addMediaConversion('large')
            ->width(1920)
            ->quality(85)
            ->performOnCollections(...$this->conversionCollections());
    }

    /**
     * @return list<string>
     */
    protected function conversionCollections(): array
    {
        return ['cover', 'gallery', 'gallery_hidden'];
    }
}
