<?php

namespace App\Support;

/**
 * Resolve smart content JSON / public assets for seeders & import commands.
 * Prefers files bundled inside this app (for shared hosting), then ../smart/.
 */
class SmartContent
{
    /**
     * Absolute path to a content JSON file, or null if missing.
     */
    public static function json(string $filename): ?string
    {
        $filename = ltrim(str_replace('\\', '/', $filename), '/');

        foreach ([
            database_path('data/smart/'.$filename),
            resource_path('content/'.$filename),
            base_path('../smart/content/'.$filename),
        ] as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Root that contains /assets/... (Laravel public/ or smart/public).
     */
    public static function publicRoot(): ?string
    {
        foreach ([
            public_path(),
            base_path('../smart/public'),
        ] as $path) {
            if (is_dir($path.DIRECTORY_SEPARATOR.'assets')) {
                return $path;
            }
        }

        return null;
    }
}
