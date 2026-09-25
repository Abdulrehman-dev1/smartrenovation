<?php

namespace App\Support;

class SmartServiceMapper
{
    /**
     * Map one smart/content/services.json item to Eloquent attributes.
     *
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    public static function attributes(array $item, int $sortOrder): array
    {
        $navLabel = is_string($item['navLabel'] ?? null) ? trim($item['navLabel']) : '';
        $heroTitle = is_string($item['heroTitle'] ?? null) ? trim($item['heroTitle']) : '';
        $metaDescription = is_string($item['metaDescription'] ?? null) ? trim($item['metaDescription']) : null;
        $ctaLabel = is_string($item['ctaLabel'] ?? null) ? trim($item['ctaLabel']) : null;
        $url = is_string($item['url'] ?? null) ? trim($item['url']) : null;

        return [
            // Card / kicker = navLabel; page H1 = heroTitle
            'title' => $navLabel !== '' ? $navLabel : ($heroTitle !== '' ? $heroTitle : 'Service'),
            'subtitle' => $heroTitle !== '' ? $heroTitle : null,
            'cta_label' => $ctaLabel !== '' ? $ctaLabel : null,
            'short_description' => $metaDescription,
            'description' => self::blocksToHtml(is_array($item['blocks'] ?? null) ? $item['blocks'] : []),
            'meta_title' => is_string($item['metaTitle'] ?? null) ? $item['metaTitle'] : null,
            'meta_description' => $metaDescription,
            'canonical_url' => $url ? url($url) : null,
            'sort_order' => $sortOrder,
            'status' => 'published',
        ];
    }

    /**
     * @param  list<mixed>  $blocks
     */
    public static function blocksToHtml(array $blocks): ?string
    {
        $parts = [];

        foreach ($blocks as $block) {
            if (! is_array($block)) {
                continue;
            }
            $tag = strtolower((string) ($block['tag'] ?? 'p'));
            $text = trim((string) ($block['text'] ?? ''));
            if ($text === '') {
                continue;
            }

            $safe = e($text);
            if ($tag === 'h2') {
                $parts[] = '<h2 class="service-body__h">'.$safe.'</h2>';
            } elseif ($tag === 'h3' || $tag === 'h4') {
                $parts[] = '<h3 class="service-body__sub">'.$safe.'</h3>';
            } else {
                $parts[] = '<p class="service-body__p">'.$safe.'</p>';
            }
        }

        return $parts === [] ? null : implode("\n", $parts);
    }
}
