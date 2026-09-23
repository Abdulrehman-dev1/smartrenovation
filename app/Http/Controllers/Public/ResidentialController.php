<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class ResidentialController extends Controller
{
    public function __invoke(): Response
    {
        $page = Page::query()->where('slug', 'residential')->first();

        return Inertia::render('Public/Residential', [
            'page' => $page,
        ]);
    }
}
