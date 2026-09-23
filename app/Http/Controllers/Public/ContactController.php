<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreLeadRequest;
use App\Models\Lead;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Public/Contact', [
            'contact' => [
                'email' => Setting::get('contact_email'),
                'phone' => Setting::get('contact_phone'),
                'address' => Setting::get('contact_address'),
            ],
        ]);
    }

    public function store(StoreLeadRequest $request): RedirectResponse
    {
        Lead::query()->create([
            ...$request->validated(),
            'source' => $request->validated('source') ?? 'contact',
        ]);

        return redirect()
            ->route('thank-you')
            ->with('success', 'Thank you. We will be in touch shortly.');
    }
}
