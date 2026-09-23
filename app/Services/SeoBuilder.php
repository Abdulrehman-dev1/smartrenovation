<?php

namespace App\Services;

class SeoBuilder
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function organization(array $data = []): array
    {
        return array_merge([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => config('app.name', 'Smart Renovation'),
            'url' => config('app.url'),
        ], $data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function webPage(string $title, string $description = '', array $data = []): array
    {
        return array_merge([
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $title,
            'description' => $description,
            'url' => url()->current(),
        ], $data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function article(string $title, string $description = '', array $data = []): array
    {
        return array_merge([
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $title,
            'description' => $description,
        ], $data);
    }

    public function toJson(array $schema): string
    {
        return json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '{}';
    }
}
