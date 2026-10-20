<?php

namespace Tests\Feature\Admin;

use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PromoteCoverImageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $user->assignRole('super-admin');

        return $user;
    }

    public function test_admin_can_swap_project_gallery_image_with_cover(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'swap-cover-project',
            'name' => 'Swap Cover Project',
            'status' => 'draft',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
            'gallery' => [UploadedFile::fake()->image('gallery-1.jpg', 800, 600)],
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'swap-cover-project')->firstOrFail();
        $oldCover = $project->cover_image;
        $galleryPath = $project->normalizedGallery('gallery_images')[0]['path'];

        $this->assertNotNull($oldCover);
        $this->assertNotSame($oldCover, $galleryPath);

        $response = $this->actingAs($user)->postJson(
            route('admin.projects.images.promote-cover', $project),
            [
                'collection' => 'gallery',
                'path' => $galleryPath,
            ]
        );

        $response->assertOk()
            ->assertJsonPath('message', 'Cover updated.')
            ->assertJsonPath('cover.path', $galleryPath);

        $project->refresh();
        $this->assertSame($galleryPath, $project->cover_image);

        $gallery = $project->normalizedGallery('gallery_images');
        $this->assertCount(1, $gallery);
        $this->assertSame($oldCover, $gallery[0]['path']);

        Storage::disk('public')->assertExists($galleryPath);
        Storage::disk('public')->assertExists($oldCover);
    }

    public function test_promote_cover_rejects_unknown_project_gallery_path(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'missing-gallery-path',
            'name' => 'Missing Gallery Path',
            'status' => 'draft',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
            'gallery' => [UploadedFile::fake()->image('gallery-1.jpg', 800, 600)],
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'missing-gallery-path')->firstOrFail();

        $this->actingAs($user)->postJson(
            route('admin.projects.images.promote-cover', $project),
            [
                'collection' => 'gallery',
                'path' => 'projects/999/gallery/does-not-exist.jpg',
            ]
        )->assertStatus(422);
    }

    public function test_admin_can_swap_service_gallery_image_with_cover(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/services', [
            'slug' => 'swap-cover-service',
            'title' => 'Swap Cover Service',
            'status' => 'draft',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
            'gallery' => [UploadedFile::fake()->image('gallery-1.jpg', 800, 600)],
        ])->assertRedirect(route('admin.services.index'));

        $service = Service::query()->where('slug', 'swap-cover-service')->firstOrFail();
        $oldCover = $service->cover_image;
        $galleryPath = $service->normalizedGallery()[0]['path'];

        $this->assertNotNull($oldCover);
        $this->assertNotSame($oldCover, $galleryPath);

        $response = $this->actingAs($user)->postJson(
            route('admin.services.images.promote-cover', $service),
            ['path' => $galleryPath]
        );

        $response->assertOk()
            ->assertJsonPath('message', 'Cover updated.')
            ->assertJsonPath('cover.path', $galleryPath);

        $service->refresh();
        $this->assertSame($galleryPath, $service->cover_image);

        $gallery = $service->normalizedGallery();
        $this->assertCount(1, $gallery);
        $this->assertSame($oldCover, $gallery[0]['path']);

        Storage::disk('public')->assertExists($galleryPath);
        Storage::disk('public')->assertExists($oldCover);
    }
}
