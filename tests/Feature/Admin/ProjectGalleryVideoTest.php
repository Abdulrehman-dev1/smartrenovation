<?php

namespace Tests\Feature\Admin;

use App\Models\Project;
use App\Models\User;
use App\Support\ProjectMedia;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectGalleryVideoTest extends TestCase
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

    public function test_admin_can_upload_video_to_project_gallery(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'video-gallery-project',
            'name' => 'Video Gallery Project',
            'status' => 'draft',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'video-gallery-project')->firstOrFail();
        $video = UploadedFile::fake()->create('walkthrough.mp4', 2048, 'video/mp4');

        $response = $this->actingAs($user)->postJson(route('admin.projects.images.store', $project), [
            'collection' => 'gallery',
            'files' => [$video],
            'rooms' => ['Other'],
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Images uploaded.')
            ->assertJsonPath('images.0.type', 'video');

        $project->refresh();
        $gallery = $project->normalizedGallery('gallery_images');
        $this->assertCount(1, $gallery);
        $this->assertTrue(ProjectMedia::isVideoPath($gallery[0]['path']));
        Storage::disk('public')->assertExists($gallery[0]['path']);

        $presented = $project->presentGallery('gallery_images');
        $this->assertSame('video', $presented[0]['type']);
    }

    public function test_cover_upload_rejects_video(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'cover-rejects-video',
            'name' => 'Cover Rejects Video',
            'status' => 'draft',
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'cover-rejects-video')->firstOrFail();
        $video = UploadedFile::fake()->create('cover.mp4', 1024, 'video/mp4');

        $response = $this->actingAs($user)->postJson(route('admin.projects.images.store', $project), [
            'collection' => 'cover',
            'files' => [$video],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('files.0');
        $this->assertNull($project->fresh()->cover_image);
    }

    public function test_promote_cover_rejects_gallery_video(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'no-video-cover',
            'name' => 'No Video Cover',
            'status' => 'draft',
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'no-video-cover')->firstOrFail();
        $oldCover = $project->cover_image;

        $this->actingAs($user)->postJson(route('admin.projects.images.store', $project), [
            'collection' => 'gallery',
            'files' => [UploadedFile::fake()->create('clip.mp4', 1024, 'video/mp4')],
            'rooms' => ['Other'],
        ])->assertOk();

        $project->refresh();
        $videoPath = $project->normalizedGallery('gallery_images')[0]['path'];

        $response = $this->actingAs($user)->postJson(
            route('admin.projects.images.promote-cover', $project),
            [
                'collection' => 'gallery',
                'path' => $videoPath,
            ]
        );

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Videos cannot be used as the cover image.');

        $project->refresh();
        $this->assertSame($oldCover, $project->cover_image);
        $this->assertSame($videoPath, $project->normalizedGallery('gallery_images')[0]['path']);
    }
}
