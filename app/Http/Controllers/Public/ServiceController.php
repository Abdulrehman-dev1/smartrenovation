<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\SeoBuilder;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        $services = Service::query()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'slug' => $service->slug,
                // Smart card: navLabel + metaDescription
                'nav_label' => $service->title,
                'meta_description' => $service->meta_description ?: $service->short_description,
                'cover_url' => $service->coverUrl(),
                'url' => '/services/'.$service->slug,
            ]);

        return Inertia::render('Public/Services', [
            'services' => $services,
        ]);
    }

    public function show(string $slug, SeoBuilder $seo): Response
    {
        $service = Service::query()->published()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/ServiceShow', [
            'service' => [
                'slug' => $service->slug,
                'nav_label' => $service->title,
                'hero_title' => $service->subtitle ?: $service->title,
                'cta_label' => $service->cta_label ?: $service->title,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'meta_title' => $service->meta_title,
                'meta_description' => $service->meta_description,
                'cover' => $service->coverUrl(),
                'gallery' => collect($service->presentGallery())
                    ->pluck('url')
                    ->filter()
                    ->values()
                    ->all(),
            ],
            'seoJsonLd' => $seo->toJson($seo->webPage(
                $service->meta_title ?: $service->title,
                (string) ($service->meta_description ?: $service->short_description)
            )),
        ]);
    }
}
