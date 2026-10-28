<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProcessController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Public/Process', [
            'seo' => [
                'title' => 'Our Design Process | From Vision to Reality',
                'description' => 'One-stop-shop approach to how we work — from first appointment to final handover with Smart Renovation Dubai.',
            ],
        ]);
    }
}
