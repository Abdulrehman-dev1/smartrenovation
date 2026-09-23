<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Award;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(): Response
    {
        $page = Page::query()->where('slug', 'about')->first();

        return Inertia::render('Public/About', [
            'page' => $page,
            'awards' => Award::query()->orderBy('sort_order')->get(),
        ]);
    }
}
