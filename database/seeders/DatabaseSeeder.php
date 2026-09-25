<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);
        $this->call(CategoryLocationSeeder::class);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@smartrenovation.ae'],
            [
                'name' => 'Admin',
                'password' => Hash::make('smartadmin!@#'),
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole('super-admin');

        $defaults = [
            'site_name' => 'Smart Renovation',
            'site_tagline' => 'Design, build & automation — Dubai',
            'contact_email' => 'info@smartrenovation.ae',
            'contact_phone' => '+971567907213',
            'whatsapp_number' => '971567907213',
            'contact_address' => 'AC01 Building, Sheikh Zayed Road, Office 106–108, Mezzanine Floor, Dubai, AE',
            'gtm_id' => 'GTM-PWQ65G5T',
            'ga4_id' => 'G-WSHMGJ39K3',
            'social_instagram' => '',
            'social_linkedin' => '',
            'seo_default_title' => 'Smart Renovation',
            'seo_default_description' => 'Smart Renovation — design, build & automation in Dubai.',
        ];

        foreach ($defaults as $key => $value) {
            Setting::set($key, $value);
        }

        $this->call(SmartProjectsSeeder::class);
        $this->call(SmartServicesSeeder::class);
        $this->call(SmartArticlesSeeder::class);
        $this->call(SmartPressSeeder::class);
        $this->call(SmartAwardsSeeder::class);
    }
}
