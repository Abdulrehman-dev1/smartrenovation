<?php

namespace App\Support;

use App\Models\Review;
use App\Models\Setting;

class ReviewsContent
{
    /**
     * @return array{heading: string, rating: float, googleLabel: string, googleUrl: string}
     */
    public static function meta(): array
    {
        $ratingRaw = Setting::get('reviews_rating', '4.8');
        $rating = is_numeric($ratingRaw) ? (float) $ratingRaw : 4.8;

        return [
            'heading' => (string) Setting::get('reviews_heading', 'What Clients Say.'),
            'rating' => $rating,
            'googleLabel' => (string) Setting::get('reviews_google_label', 'Verified Google Reviews'),
            'googleUrl' => (string) Setting::get(
                'reviews_google_url',
                'https://www.google.com/maps/search/Smart+Renovation+Dubai'
            ),
        ];
    }

    /**
     * @return list<array{text: string, who: string, where: string, rating: int}>
     */
    public static function publishedCards(): array
    {
        return Review::query()
            ->published()
            ->latest('id')
            ->get()
            ->map(fn (Review $review) => $review->toPublicCard())
            ->values()
            ->all();
    }
}
