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

class RichTextEditorTest extends TestCase
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

    public function test_project_description_stores_sanitized_rich_html(): void
    {
        $user = $this->admin();
        $category = Category::query()->where('slug', 'apartment')->firstOrFail();
        $location = Location::query()->where('name', 'Dubai Marina & JBR')->firstOrFail();

        $html = '<h2>Scope</h2><p>Full renovation with <a href="https://example.com">details</a>.</p>'
            .'<ul><li>Living</li><li>Kitchen</li></ul>'
            .'<img src="https://cdn.example.com/room.jpg" alt="Room">'
            .'<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="640" height="360"></iframe>'
            .'<script>alert(1)</script>';

        $response = $this->actingAs($user)->post('/admin/projects', [
            'slug' => 'rich-project',
            'name' => 'Rich Project',
            'category_id' => $category->id,
            'location_id' => $location->id,
            'rooms' => ['Living'],
            'description' => $html,
            'status' => 'published',
            'published_at' => now()->toDateTimeString(),
        ]);

        $response->assertRedirect(route('admin.projects.index'));

        $project = Project::query()->where('slug', 'rich-project')->firstOrFail();

        $this->assertStringContainsString('<h2>Scope</h2>', $project->description);
        $this->assertStringContainsString('<ul><li>Living</li><li>Kitchen</li></ul>', $project->description);
        $this->assertStringContainsString('href="https://example.com"', $project->description);
        $this->assertStringContainsString('<img src="https://cdn.example.com/room.jpg"', $project->description);
        $this->assertStringContainsString('youtube.com/embed/dQw4w9WgXcQ', $project->description);
        $this->assertStringNotContainsString('<script>', $project->description);

        $this->get(route('works.show', 'rich-project'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/ProjectShow')
                ->where('project.description', fn ($value) => is_string($value)
                    && str_contains($value, '<h2>Scope</h2>')
                    && str_contains($value, 'youtube.com/embed')
                    && ! str_contains($value, '<script>'))
            );
    }

    public function test_editor_image_upload_stores_public_file(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $file = UploadedFile::fake()->image('editor.jpg', 800, 600);

        $response = $this->actingAs($user)->postJson('/admin/editor-uploads', [
            'file' => $file,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['url']);

        $url = $response->json('url');
        $this->assertIsString($url);
        $this->assertStringContainsString('/storage/editor/', $url);

        $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH) ?? '');
        Storage::disk('public')->assertExists($path);
    }

    public function test_editor_upload_rejects_non_image(): void
    {
        Storage::fake('public');
        $user = $this->admin();

        $file = UploadedFile::fake()->create('notes.txt', 100, 'text/plain');

        $this->actingAs($user)
            ->postJson('/admin/editor-uploads', ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }
}
