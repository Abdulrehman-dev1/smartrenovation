<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Models\User;
use App\Support\ProjectImageStorage;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectGalleryRoomsTest extends TestCase
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

    public function test_create_stores_gallery_items_with_room_tags(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'room-tagged',
            'name' => 'Room Tagged',
            'status' => 'draft',
            'gallery' => [
                UploadedFile::fake()->image('kitchen.jpg', 400, 300),
                UploadedFile::fake()->image('living.jpg', 400, 300),
            ],
            'gallery_rooms' => ['Kitchen', 'Living'],
        ])->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'room-tagged')->firstOrFail();
        $gallery = $project->normalizedGallery('gallery_images');

        $this->assertCount(2, $gallery);
        $this->assertSame('Kitchen', $gallery[0]['room']);
        $this->assertSame('Living', $gallery[1]['room']);
        $this->assertEqualsCanonicalizing(['Kitchen', 'Living'], $project->rooms);
    }

    public function test_transfer_preserves_room_and_update_rooms_endpoint_works(): void
    {
        Storage::fake('public');
        $user = $this->admin();
        $project = Project::query()->create([
            'slug' => 'transfer-rooms',
            'name' => 'Transfer Rooms',
            'status' => 'draft',
        ]);

        $storage = app(ProjectImageStorage::class);
        $added = $storage->appendGallery(
            $project,
            [UploadedFile::fake()->image('a.jpg', 200, 200)],
            'gallery_images',
            ['Bathroom']
        );
        $path = $added[0]['path'];

        $this->actingAs($user)->post(route('admin.projects.images.transfer', $project), [
            'from' => 'gallery',
            'to' => 'gallery_hidden',
            'paths' => [$path],
        ])->assertOk();

        $project->refresh();
        $this->assertSame([], $project->normalizedGallery('gallery_images'));
        $hidden = $project->normalizedGallery('gallery_hidden');
        $this->assertCount(1, $hidden);
        $this->assertSame('Bathroom', $hidden[0]['room']);
        $this->assertSame([], $project->rooms);

        $this->actingAs($user)->post(route('admin.projects.images.transfer', $project), [
            'from' => 'gallery_hidden',
            'to' => 'gallery',
            'paths' => [$path],
        ])->assertOk();

        $this->actingAs($user)->post(route('admin.projects.images.rooms', $project), [
            'collection' => 'gallery',
            'updates' => [
                ['path' => $path, 'room' => 'Kitchen'],
            ],
        ])->assertOk()
            ->assertJsonPath('gallery.0.room', 'Kitchen');

        $project->refresh();
        $this->assertSame(['Kitchen'], $project->rooms);
    }

    public function test_works_room_filter_returns_room_photos(): void
    {
        Storage::fake('public');
        $this->seed(RoleAndPermissionSeeder::class);

        $category = Category::query()->where('slug', 'apartment')->firstOrFail();
        $location = Location::query()->where('name', 'Palm Jumeirah')->firstOrFail();

        $project = Project::query()->create([
            'slug' => 'oceana-test',
            'name' => 'Oceana Test',
            'status' => 'published',
            'published_at' => now(),
            'category_id' => $category->id,
            'location_id' => $location->id,
        ]);

        app(ProjectImageStorage::class)->appendGallery(
            $project,
            [
                UploadedFile::fake()->image('k1.jpg', 200, 200),
                UploadedFile::fake()->image('l1.jpg', 200, 200),
            ],
            'gallery_images',
            ['Kitchen', 'Living']
        );

        $this->get('/works?room=Kitchen')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/Works')
                ->where('filters.room', 'Kitchen')
                ->has('roomPhotos', 1)
                ->where('roomPhotos.0.slug', 'oceana-test')
                ->where('roomPhotos.0.room', 'Kitchen')
                ->where('projects', [])
            );
    }
}
