<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        $this->authorize('viewAny', Setting::class);

        $keys = [
            'site_name',
            'site_tagline',
            'contact_email',
            'contact_phone',
            'whatsapp_number',
            'contact_address',
            'gtm_id',
            'ga4_id',
            'social_instagram',
            'social_linkedin',
            'seo_default_title',
            'seo_default_description',
        ];

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key, '');
        }

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => $settings,
            'can' => [
                'edit' => request()->user()->can('settings.edit'),
            ],
        ]);
    }

    public function update(UpdateSettingRequest $request): RedirectResponse
    {
        foreach ($request->validated('settings') as $key => $value) {
            Setting::set($key, $value);
        }

        return redirect()
            ->route('admin.settings.edit')
            ->with('success', 'Settings were successfully updated.');
    }
}
