<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Location;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectCrudTest extends TestCase
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

    public function test_admin_can_create_project_with_images_and_seo(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $category = Category::query()->where('slug', 'apartment')->firstOrFail();
        $location = Location::query()->where('name', 'Dubai Marina & JBR')->firstOrFail();

        $schema = json_encode([
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => 'Marina Residence',
        ], JSON_THROW_ON_ERROR);

        $response = $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'marina-residence',
            'name' => 'Marina Residence',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'studio' => 'Smart Studio',
            'subtitle' => 'A waterfront renovation',
            'description' => '<p>Full interior renovation.</p>',
            'status' => 'published',
            'published_at' => now()->toDateTimeString(),
            'meta_title' => 'Marina Residence SEO',
            'meta_description' => 'Project meta',
            'canonical_url' => 'https://example.com/works/marina-residence',
            'schema_json' => $schema,
            'cover' => UploadedFile::fake()->image('cover.jpg', 800, 600),
            'gallery' => [UploadedFile::fake()->image('g1.jpg', 800, 600)],
        ]);

        $response->assertRedirect(route('admin.projects.index'));
        $this->assertDatabaseHas('projects', [
            'slug' => 'marina-residence',
            'name' => 'Marina Residence',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'studio' => 'Smart Studio',
            'canonical_url' => 'https://example.com/works/marina-residence',
        ]);

        $project = Project::query()->where('slug', 'marina-residence')->firstOrFail();
        $this->assertNotNull($project->cover_image);
        $this->assertNotEmpty($project->gallery_images);
        $gallery = $project->normalizedGallery('gallery_images');
        $this->assertSame('Other', $gallery[0]['room']);
        Storage::disk('public')->assertExists($project->cover_image);

        $this->actingAs($user)
            ->get(route('admin.projects.show', 'marina-residence'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Projects/Show')
                ->where('project.name', 'Marina Residence')
            );

        $this->get(route('works.show', 'marina-residence'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/ProjectShow')
                ->where('project.name', 'Marina Residence')
                ->where('seo.title', 'Marina Residence SEO')
                ->where('seo.canonical', 'https://example.com/works/marina-residence')
                ->where('seo.jsonLd', fn ($value) => is_string($value) && str_contains($value, 'Marina Residence'))
            );
    }

    public function test_create_page_renders_without_draft(): void
    {
        $user = $this->admin();

        $this->actingAs($user)
            ->get('/admin/projects/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Projects/Create'));

        $this->assertSame(0, Project::query()->count());
    }

    public function test_invalid_schema_json_is_rejected(): void
    {
        $user = $this->admin();

        $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'bad-schema',
            'name' => 'Bad Schema',
            'status' => 'draft',
            'schema_json' => '{not-json',
        ])->assertSessionHasErrors('schema_json');
    }

    public function test_user_without_permission_cannot_create_project(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'blocked-project',
            'name' => 'Blocked',
            'status' => 'draft',
        ]);

        $response->assertForbidden();
    }
}
