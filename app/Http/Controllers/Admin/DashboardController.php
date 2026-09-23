<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'projects' => Project::query()->count(),
                'services' => Service::query()->count(),
                'articles' => Article::query()->count(),
                'leads' => Lead::query()->count(),
            ],
        ]);
    }
}
