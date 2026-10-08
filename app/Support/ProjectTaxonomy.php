<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Location;

class ProjectTaxonomy
{
    /**
     * @return array<string, string> key => label
     */
    public static function categories(): array
    {
        return [
            'villa' => 'Villas',
            'apartment' => 'Apartments',
            'penthouse' => 'Penthouses',
            'residence' => 'Residences',
            'landscape' => 'Landscape',
            'commercial' => 'Commercial',
        ];
    }

    /**
     * @return array<string, string> category key => type label
     */
    public static function typeLabels(): array
    {
        return [
            'villa' => 'Villa',
            'apartment' => 'Apartment',
            'penthouse' => 'Penthouse',
            'residence' => 'Residence',
            'landscape' => 'Landscape Design',
            'commercial' => 'Commercial',
        ];
    }

    /**
     * Unique work__meta "after ·" values from smart Works page / projects.json.
     *
     * @return list<string>
     */
    public static function locations(): array
    {
        return [
            'Villa Renovation',
            'Apartment Renovation',
            'Shoreline Palm Jumeirah',
            'Arabian Ranches',
            'Palm Jumeirah',
            'Dubai Marina & JBR',
            'Victory Heights',
            'Arabian Ranches Saheel',
            'MBR City',
            'The Villa',
            'Meadows',
            'Bathroom Renovation',
            'Kitchen Renovation',
            'Dubai Marina',
            'City Walk',
            'Umm Suqeim',
            'Motor City',
            'Jumeirah Park',
            'Marina Residences',
            'Jumeirah & Umm Suqeim',
            'Home Renovation',
            'Jumeirah Islands',
            'Green Community',
            'Al Furjan',
            'Arabian Ranches — Alvorada',
            'Central Park, Downtown Dubai',
            'JVT',
            'Trident Waterfront Residence',
            'Canal Front Marina Dubai',
            'Sicily, Italy',
            'Shoreline, Palm Jumeirah',
            'Arabian Ranches — Saheel',
            'Dubai Hills',
            'Marina Residence Palm Jumeirah',
            'Palm Jumeirah Frond P',
            'Cayan Tower Dubai Marina',
            'Ocean Heights Marina',
            'Jumeirah Golf Estates',
            'Palma Residences Villa',
            'Emirates Hills',
            'Fairmont Palm Jumeirah',
            'Mira',
            'Apartment Renovation (Unfurnished)',
            'Penthouse Renovation',
            'Emirates Living',
        ];
    }

    public const OTHER_ROOM = 'Other';

    public const OTHER_COMMUNITIES = 'Other Communities';

    public const DEFAULT_COLLECTION_AR = 1.33;

    /**
     * Public /works location filter pills (smart WorksClient LOCATIONS order).
     *
     * @return list<string>
     */
    public static function worksFilterLocations(): array
    {
        return [
            'Palm Jumeirah',
            'Dubai Marina & JBR',
            'Arabian Ranches',
            'Emirates Living',
            'Victory Heights',
            'Jumeirah & Umm Suqeim',
            'Downtown & Bay',
            'MBR City',
            'Motor City',
            'The Villa',
            'Mira',
            'Al Furjan',
            'Sicily, Italy',
            self::OTHER_COMMUNITIES,
        ];
    }

    /**
     * Named communities shown in the works filter (excludes Other Communities).
     *
     * @return list<string>
     */
    public static function worksNamedCommunities(): array
    {
        return array_values(array_filter(
            self::worksFilterLocations(),
            fn (string $name) => $name !== self::OTHER_COMMUNITIES
        ));
    }

    /**
     * Map a DB location / project title to a works filter community.
     * Returns null when the project belongs under Other Communities.
     */
    public static function resolveWorksCommunity(?string $locationName, ?string $slug = null, ?string $title = null): ?string
    {
        $named = array_flip(self::worksNamedCommunities());

        $rawLocation = is_string($locationName) ? trim($locationName) : '';
        if ($rawLocation !== '' && isset($named[$rawLocation])) {
            return $rawLocation;
        }

        $slugAreas = [
            'viaggio-in-italia' => 'Arabian Ranches',
            'casa-bellissima' => 'Arabian Ranches',
            'la-maison-oriental' => 'Al Furjan',
        ];
        if (is_string($slug) && isset($slugAreas[$slug])) {
            return $slugAreas[$slug];
        }

        $haystack = strtolower(trim(implode(' ', array_filter([
            $rawLocation,
            is_string($slug) ? str_replace('-', ' ', $slug) : null,
            is_string($title) ? $title : null,
        ]))));

        if ($haystack === '') {
            return null;
        }

        foreach (self::worksAreaRules() as $community => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($haystack, $keyword)) {
                    return $community;
                }
            }
        }

        return null;
    }

    /**
     * Location IDs that belong to a works filter community (or Other Communities).
     *
     * @return list<int>
     */
    public static function locationIdsForWorksFilter(string $filter): array
    {
        $locations = Location::query()->get(['id', 'name']);
        $ids = [];

        foreach ($locations as $location) {
            $community = self::resolveWorksCommunity($location->name);
            $matches = $filter === self::OTHER_COMMUNITIES
                ? $community === null
                : $community === $filter;

            if ($matches) {
                $ids[] = (int) $location->id;
            }
        }

        return $ids;
    }

    /**
     * Smart lib/projects.js AREA_RULES for works filter communities.
     *
     * @return array<string, list<string>>
     */
    public static function worksAreaRules(): array
    {
        return [
            'Palm Jumeirah' => ['palm jumeirah', 'palm shoreline', 'shoreline', 'the palm', 'palm frond', 'frond p', 'marina residence', 'marina residences', 'palma residence', 'oceana', 'tiara', 'fairmont palm', 'trident'],
            'Dubai Marina & JBR' => ['dubai marina', 'marina heights', 'marina quays', 'marina park', 'park island', 'ocean heights', 'cayan', 'botanica', 'stella maris', 'giardino verticale', 'jbr', 'rimal'],
            'Arabian Ranches' => ['arabian ranches', 'saheel', 'alvorada', 'al maha', 'mirador', 'la colleccion'],
            'Emirates Living' => ['emirates hills', 'meadows', 'springs', 'the lakes', 'hattan'],
            'Victory Heights' => ['victory heights', 'victory', 'marabella', 'silk road'],
            'Jumeirah & Umm Suqeim' => ['jumeirah park', 'jumeirah islands', 'jumeirah villa', 'jumeirah 1', 'jumeirah golf', 'al saffee', 'umm suqeim', 'umm suqueim'],
            'Downtown & Bay' => ['downtown', 'business bay', 'difc', 'city walk', 'canal', 'central park', 'new york apartment'],
            'MBR City' => ['mbr', 'district 1'],
            'Motor City' => ['motor city', 'freddy mercury', 'sanctuary of emerald'],
            'The Villa' => ['the villa'],
            'Mira' => ['mira villa'],
            'Al Furjan' => ['al furjan', 'furjan', 'grandhuer'],
            'Sicily, Italy' => ['sicily'],
        ];
    }

    /**
     * Collection board style labels (smart Collection page).
     *
     * @return list<string>
     */
    public static function collectionStyles(): array
    {
        return [
            'Mediterranean',
            'Italian Heritage',
            'Oriental',
            'Modern Minimalist',
            'Glam Eclectic',
        ];
    }

    /**
     * Filter pills / derived project rooms (excludes Other).
     *
     * @return list<string>
     */
    public static function rooms(): array
    {
        return [
            'Living',
            'Kitchen',
            'Dining',
            'Bedroom',
            'Bathroom',
            'Outdoor',
        ];
    }

    /**
     * Allowed room tags on gallery images (includes Other).
     *
     * @return list<string>
     */
    public static function imageRooms(): array
    {
        return [...self::rooms(), self::OTHER_ROOM];
    }

    public static function otherRoom(): string
    {
        return self::OTHER_ROOM;
    }

    /**
     * Resolve location the same way smart Works shows work__meta after "·":
     * locationOf(p) || areaOf(p) — prefer exact names from locations().
     *
     * @param  array{slug?: string, title?: string, name?: string, location?: string|null}  $item
     */
    public static function resolveAreaFromSmartProject(array $item): ?string
    {
        $fromLocationOf = self::locationOfSmartProject($item);
        if ($fromLocationOf !== null) {
            return $fromLocationOf;
        }

        return self::areaOfSmartProject($item);
    }

    /**
     * Smart lib/projects.js locationOf().
     *
     * @param  array{slug?: string, title?: string, name?: string, location?: string|null}  $item
     */
    public static function locationOfSmartProject(array $item): ?string
    {
        $raw = is_string($item['location'] ?? null) ? trim($item['location']) : '';
        if ($raw !== '') {
            return self::matchLocationName($raw) ?? $raw;
        }

        $title = (string) ($item['title'] ?? $item['name'] ?? '');
        $parts = array_values(array_filter(array_map('trim', explode('|', $title)), fn (string $p) => $p !== ''));
        if (count($parts) < 2) {
            return null;
        }

        $last = $parts[count($parts) - 1];
        if ($last === '' || preg_match('/smart\s*renovation/i', $last)) {
            return null;
        }

        return self::matchLocationName($last) ?? $last;
    }

    /**
     * Smart lib/projects.js areaOf() with names that exist in locations().
     *
     * @param  array{slug?: string, title?: string, name?: string, location?: string|null}  $item
     */
    public static function areaOfSmartProject(array $item): ?string
    {
        $slugAreas = [
            'viaggio-in-italia' => 'Arabian Ranches',
            'casa-bellissima' => 'Arabian Ranches — Alvorada',
            'la-maison-oriental' => 'Al Furjan',
        ];

        $slug = $item['slug'] ?? null;
        if (is_string($slug) && isset($slugAreas[$slug])) {
            return $slugAreas[$slug];
        }

        $haystack = strtolower(trim(
            (is_string($slug) ? str_replace('-', ' ', $slug).' ' : '').
            (string) ($item['title'] ?? $item['name'] ?? '')
        ));

        $rules = [
            'JVT' => ['jvt'],
            'JVC' => ['jvc'],
            'Green Community' => ['green community'],
            'Dubai Hills' => ['dubai hills'],
            'Jumeirah Golf Estates' => ['jumeirah golf', 'golf estates'],
            'Palma Residences Villa' => ['palma residences'],
            'City Walk' => ['city walk'],
            'Central Park, Downtown Dubai' => ['central park', 'downtown'],
            'Palm Jumeirah' => ['palm jumeirah', 'palm shoreline', 'shoreline', 'the palm', 'palm frond', 'frond p', 'marina residence', 'marina residences', 'palma residence', 'oceana', 'tiara', 'fairmont palm', 'trident'],
            'Dubai Marina & JBR' => ['dubai marina', 'marina heights', 'marina quays', 'marina park', 'park island', 'ocean heights', 'cayan', 'botanica', 'stella maris', 'giardino verticale', 'jbr', 'rimal'],
            'Arabian Ranches' => ['arabian ranches', 'saheel', 'alvorada', 'al maha', 'mirador', 'la colleccion'],
            'Emirates Living' => ['emirates hills', 'meadows', 'springs', 'the lakes', 'hattan'],
            'Victory Heights' => ['victory heights', 'victory', 'marabella', 'silk road'],
            'Jumeirah & Umm Suqeim' => ['jumeirah park', 'jumeirah islands', 'jumeirah villa', 'jumeirah 1', 'al saffee', 'umm suqeim', 'umm suqueim'],
            'MBR City' => ['mbr', 'district 1'],
            'Motor City' => ['motor city', 'freddy mercury', 'sanctuary of emerald'],
            'The Villa' => ['the villa'],
            'Mira' => ['mira villa'],
            'Al Furjan' => ['al furjan', 'furjan', 'grandhuer'],
            'Sicily, Italy' => ['sicily'],
        ];

        foreach ($rules as $name => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($haystack, $keyword)) {
                    return $name;
                }
            }
        }

        return null;
    }

    private static function matchLocationName(string $raw): ?string
    {
        $allowed = array_flip(self::locations());
        if (isset($allowed[$raw])) {
            return $raw;
        }

        $lower = strtolower($raw);
        foreach (self::locations() as $name) {
            if (strtolower($name) === $lower) {
                return $name;
            }
        }

        foreach (self::locations() as $name) {
            if (str_contains($lower, strtolower($name)) || str_contains(strtolower($name), $lower)) {
                return $name;
            }
        }

        $aliases = [
            'jumeirah islands' => 'Jumeirah Islands',
            'green community' => 'Green Community',
            'central park in downtown' => 'Central Park, Downtown Dubai',
            'central park' => 'Central Park, Downtown Dubai',
            'downtown dubai' => 'Central Park, Downtown Dubai',
            'alvorada' => 'Arabian Ranches — Alvorada',
            'jvt' => 'JVT',
            'palm jumeirah' => 'Palm Jumeirah',
            'dubai marina' => 'Dubai Marina',
            'shoreline palm jumeirah' => 'Shoreline Palm Jumeirah',
            'arabian ranches' => 'Arabian Ranches',
            'al furjan' => 'Al Furjan',
        ];

        foreach ($aliases as $needle => $name) {
            if ($lower === $needle || str_contains($lower, $needle)) {
                return $name;
            }
        }

        return null;
    }

    /** @deprecated use matchLocationName */
    private static function normalizeRawLocation(string $raw): ?string
    {
        return self::matchLocationName($raw);
    }

    /**
     * Props for Inertia create/edit forms (from DB).
     *
     * @return array{
     *     categories: list<array{id: int, value: string, label: string, type_label?: string|null}>,
     *     locations: list<array{id: int, name: string}>,
     *     rooms: list<string>,
     *     image_rooms: list<string>,
     *     collection_styles: list<string>
     * }
     */
    public static function formOptions(): array
    {
        return [
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'slug', 'name', 'type_label'])
                ->map(fn (Category $c) => [
                    'id' => $c->id,
                    'value' => $c->slug,
                    'label' => $c->name,
                    'type_label' => $c->type_label,
                ])
                ->values()
                ->all(),
            'locations' => Location::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Location $l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                ])
                ->values()
                ->all(),
            'rooms' => self::rooms(),
            'image_rooms' => self::imageRooms(),
            'collection_styles' => self::collectionStyles(),
        ];
    }

    public static function typeForCategory(?string $category): ?string
    {
        if (! $category) {
            return null;
        }

        return self::typeLabels()[$category] ?? null;
    }
}
