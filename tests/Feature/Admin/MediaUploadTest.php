<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_media_upload_rejects_bad_mime(): void
    {
        Storage::fake('public');
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $user->assignRole('super-admin');

        $file = UploadedFile::fake()->create('notes.txt', 100, 'text/plain');

        $response = $this->actingAs($user)->post('/admin/media-tester', [
            'files' => [$file],
            'collection' => 'gallery',
        ]);

        $response->assertSessionHasErrors('files.0');
    }
}
