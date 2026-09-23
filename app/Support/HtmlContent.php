<?php

namespace App\Support;

class HtmlContent
{
    /**
     * Allow CMS rich-text tags; strip scripts and unsafe attributes basically via strip_tags.
     */
    public static function sanitize(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return null;
        }

        $allowed = '<p><br><h1><h2><h3><h4><h5><h6><ul><ol><li><a><strong><em><b><i><u><img><iframe><blockquote><figure><figcaption><video><source><span><div><hr>';
        $clean = strip_tags($html, $allowed);

        // Drop javascript: URLs in href/src
        $clean = preg_replace('/\s(on\w+)\s*=\s*("|\')[^"\']*("|\')/i', '', $clean) ?? $clean;
        $clean = preg_replace('/(href|src)\s*=\s*("|\')\s*javascript:[^"\']*("|\')/i', '$1=$2#$3', $clean) ?? $clean;

        // Only allow youtube/vimeo iframes
        $clean = preg_replace_callback('/<iframe\b[^>]*>.*?<\/iframe>/is', function (array $matches) {
            $tag = $matches[0];
            if (preg_match('/src\s*=\s*("|\')(https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be|player\.vimeo\.com)[^"\']*)\1/i', $tag)) {
                return $tag;
            }

            return '';
        }, $clean) ?? $clean;

        return $clean;
    }
}
