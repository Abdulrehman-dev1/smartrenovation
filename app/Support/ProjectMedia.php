<?php

namespace App\Support;

class ProjectMedia
{
    /**
     * @return list<string>
     */
    public static function imageExtensions(): array
    {
        return ['jpeg', 'jpg', 'png', 'webp'];
    }

    /**
     * @return list<string>
     */
    public static function videoExtensions(): array
    {
        return ['mp4', 'webm'];
    }

    /**
     * @return list<string>
     */
    public static function galleryExtensions(): array
    {
        return array_merge(self::imageExtensions(), self::videoExtensions());
    }

    /**
     * @return list<string>
     */
    public static function imageMimeTypes(): array
    {
        return ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
    }

    /**
     * @return list<string>
     */
    public static function videoMimeTypes(): array
    {
        return ['video/mp4', 'video/webm'];
    }

    /**
     * @return list<string>
     */
    public static function galleryMimeTypes(): array
    {
        return array_merge(self::imageMimeTypes(), self::videoMimeTypes());
    }

    /**
     * Laravel validation rules for a single cover image upload.
     *
     * @return list<string>
     */
    public static function coverFileRules(): array
    {
        return [
            'file',
            'mimes:'.implode(',', self::imageExtensions()),
            'mimetypes:'.implode(',', self::imageMimeTypes()),
            'max:51200',
        ];
    }

    /**
     * Laravel validation rules for a single gallery image or video upload.
     *
     * @return list<string>
     */
    public static function galleryFileRules(): array
    {
        return [
            'file',
            'mimes:'.implode(',', self::galleryExtensions()),
            'mimetypes:'.implode(',', self::galleryMimeTypes()),
            'max:102400',
        ];
    }

    public static function isVideoPath(?string $path): bool
    {
        if (! is_string($path) || $path === '') {
            return false;
        }

        $extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?: $path, PATHINFO_EXTENSION));

        return in_array($extension, self::videoExtensions(), true);
    }

    public static function isImagePath(?string $path): bool
    {
        if (! is_string($path) || $path === '') {
            return false;
        }

        $extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?: $path, PATHINFO_EXTENSION));

        return in_array($extension, self::imageExtensions(), true);
    }
}
