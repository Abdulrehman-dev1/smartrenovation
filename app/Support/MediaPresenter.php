<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaPresenter
{
    /**
     * @return array{id: int, name: string, thumb: string|null, card: string|null, large: string|null, original: string, collection: string}
     */
    public static function toArray(Media $media): array
    {
        $thumb = $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : null;
        $card = $media->hasGeneratedConversion('card') ? $media->getUrl('card') : null;
        $large = $media->hasGeneratedConversion('large') ? $media->getUrl('large') : null;

        return [
            'id' => $media->id,
            'name' => $media->name,
            'collection' => $media->collection_name,
            'thumb' => $thumb,
            'card' => $card ?? $large ?? $media->getUrl(),
            'large' => $large ?? $card ?? $media->getUrl(),
            'original' => $media->getUrl(),
            'processing' => ! $thumb && ! $media->hasGeneratedConversion('card') && ! $media->hasGeneratedConversion('large'),
        ];
    }

    /**
     * @param  iterable<Media>  $mediaItems
     * @return list<array{id: int, name: string, thumb: string|null, card: string|null, large: string|null, original: string, collection: string}>
     */
    public static function collection(iterable $mediaItems): array
    {
        $result = [];

        foreach ($mediaItems as $media) {
            $result[] = self::toArray($media);
        }

        return $result;
    }
}
