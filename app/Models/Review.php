<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'star',
        'review',
        'name',
        'location',
        'from',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'star' => 'integer',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Public slider card shape expected by ReviewsSection.
     *
     * @return array{text: string, who: string, where: string, rating: int}
     */
    public function toPublicCard(): array
    {
        $where = collect([$this->location, $this->from])
            ->map(fn ($v) => is_string($v) ? trim($v) : '')
            ->filter()
            ->implode(' · ');

        return [
            'text' => (string) $this->review,
            'who' => (string) $this->name,
            'where' => $where,
            'rating' => max(1, min(5, (int) $this->star)),
        ];
    }
}
