<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Support\ProjectTaxonomy;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function __invoke(): Response
    {
        $pins = [];

        Project::query()
            ->published()
            ->whereNotNull('collection_images')
            ->orderBy('name')
            ->get()
            ->each(function (Project $project) use (&$pins) {
                foreach ($project->normalizedCollectionImages() as $image) {
                    $url = $project->pathToUrl($image['path']);
                    if (! $url) {
                        continue;
                    }

                    $pins[] = [
                        'img' => $url,
                        'style' => $image['style'],
                        'slug' => $project->slug,
                        'title' => $project->name,
                        'ar' => $image['ar'] ?: ProjectTaxonomy::DEFAULT_COLLECTION_AR,
                    ];
                }
            });

        usort($pins, function (array $a, array $b) {
            return $this->hashSortKey($a['img']) <=> $this->hashSortKey($b['img']);
        });

        $stylesPresent = collect($pins)->pluck('style')->unique()->values()->all();
        $styles = array_values(array_filter(
            ProjectTaxonomy::collectionStyles(),
            fn (string $s) => in_array($s, $stylesPresent, true)
        ));

        return Inertia::render('Public/Collection', [
            'items' => array_values($pins),
            'styles' => $styles,
        ]);
    }

    private function hashSortKey(string $img): int
    {
        $s = 7;
        $len = strlen($img);
        for ($i = 0; $i < $len; $i++) {
            $s = ($s * 31 + ord($img[$i])) % 100000;
        }

        return $s;
    }
}
