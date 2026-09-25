<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(): Response
    {
        $page = Page::query()->where('slug', 'about')->first();
        $fallback = $this->loadAboutJson();

        $about = $page?->sections['about'] ?? $fallback['about'];
        $team = $page?->sections['team'] ?? $fallback['team'];

        return Inertia::render('Public/About', [
            'about' => $about,
            'team' => $team,
        ]);
    }

    /**
     * @return array{about: array<string, mixed>, team: array<string, mixed>}
     */
    private function loadAboutJson(): array
    {
        $path = resource_path('content/about.json');
        if (! is_file($path)) {
            return [
                'about' => [
                    'heading' => 'About Smart Renovation',
                    'html' => '<p>Smart Renovation.</p>',
                    'images' => [],
                ],
                'team' => [
                    'heading' => 'Meet The Team',
                    'intro' => null,
                    'members' => [],
                ],
            ];
        }

        /** @var array{about: array<string, mixed>, team: array<string, mixed>} $data */
        $data = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        return $data;
    }
}
