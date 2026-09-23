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
            ->orderBy('title')
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'slug' => $service->slug,
                'title' => $service->title,
                'subtitle' => $service->subtitle,
                'short_description' => $service->short_description,
                'cover_url' => $service->coverUrl(),
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
                'title' => $service->title,
                'subtitle' => $service->subtitle,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'meta_description' => $service->meta_description,
                'cover' => $service->cover_image
                    ? [
                        'path' => $service->cover_image,
                        'url' => $service->coverUrl(),
                        'name' => basename($service->cover_image),
                    ]
                    : null,
                'gallery' => $service->presentGallery(),
            ],
            'seoJsonLd' => $seo->toJson($seo->webPage(
                $service->meta_title ?: $service->title,
                (string) ($service->meta_description ?: $service->short_description)
            )),
        ]);
    }
}
