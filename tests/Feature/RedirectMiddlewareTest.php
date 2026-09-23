<?php

namespace Tests\Feature;

use App\Models\Redirect;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RedirectMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_redirect_returns_301(): void
    {
        Redirect::query()->create([
            'from_path' => '/old-works',
            'to_path' => '/works',
            'status_code' => 301,
            'is_active' => true,
        ]);

        $response = $this->get('/old-works');

        $response->assertRedirect('/works');
        $response->assertStatus(301);
    }

    public function test_inactive_redirect_is_ignored(): void
    {
        Redirect::query()->create([
            'from_path' => '/ghost',
            'to_path' => '/works',
            'status_code' => 301,
            'is_active' => false,
        ]);

        $response = $this->get('/ghost');

        $response->assertNotFound();
    }
}
