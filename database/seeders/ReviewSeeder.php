<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'star' => 5,
                'review' => 'From first sketch to handover the team stayed meticulous and on schedule. Our villa feels brand new.',
                'name' => 'Sarah M.',
                'location' => 'Palm Jumeirah',
                'from' => 'Google',
                'status' => 'published',
            ],
            [
                'star' => 5,
                'review' => 'Beautiful craftsmanship and clear communication throughout. One studio handled everything end to end.',
                'name' => 'Ahmed K.',
                'location' => 'Emirates Hills',
                'from' => 'Google',
                'status' => 'published',
            ],
            [
                'star' => 5,
                'review' => 'They reinvented our apartment completely — elegant, smart and genuinely stress-free from day one.',
                'name' => 'Elena R.',
                'location' => 'Dubai Marina',
                'from' => 'Google',
                'status' => 'published',
            ],
            [
                'star' => 5,
                'review' => 'Honest pricing and a daily on-site presence. The fit-out was delivered ahead of schedule.',
                'name' => 'Y. Hassan',
                'location' => 'DIFC',
                'from' => 'Google',
                'status' => 'published',
            ],
            [
                'star' => 5,
                'review' => 'Their understanding of Italian craftsmanship is on another level. The detailing is exquisite.',
                'name' => 'L. Romano',
                'location' => 'Downtown',
                'from' => 'Google',
                'status' => 'published',
            ],
            [
                'star' => 5,
                'review' => 'Calm, considered and completely tailored. The penthouse finally feels like ours.',
                'name' => 'F. Noor',
                'location' => 'Business Bay',
                'from' => 'Google',
                'status' => 'published',
            ],
        ];

        foreach ($rows as $row) {
            Review::query()->updateOrCreate(
                [
                    'name' => $row['name'],
                    'review' => $row['review'],
                ],
                $row
            );
        }
    }
}
