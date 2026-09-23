<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('name')->nullable()->after('slug');
            $table->foreignId('category_id')->nullable()->after('name')->constrained('categories')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->after('category_id')->constrained('locations')->nullOnDelete();
            $table->string('studio')->nullable()->after('location_id');
            $table->string('cover_image')->nullable()->after('description');
            $table->json('gallery_images')->nullable()->after('cover_image');
            $table->json('gallery_hidden')->nullable()->after('gallery_images');
            $table->string('canonical_url', 2048)->nullable()->after('meta_description');
            $table->longText('schema_json')->nullable()->after('canonical_url');
        });

        // Copy title → name and map taxonomy strings → FKs + Spatie media → paths
        $categories = DB::table('categories')->get()->keyBy('slug');
        $locationsByName = DB::table('locations')->get()->keyBy('name');

        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            $categoryId = null;
            if (! empty($project->category) && isset($categories[$project->category])) {
                $categoryId = $categories[$project->category]->id;
            }

            $locationId = null;
            if (! empty($project->location) && isset($locationsByName[$project->location])) {
                $locationId = $locationsByName[$project->location]->id;
            }

            $cover = null;
            $gallery = [];
            $galleryHidden = [];

            $mediaRows = DB::table('media')
                ->where('model_type', 'App\\Models\\Project')
                ->where('model_id', $project->id)
                ->orderBy('order_column')
                ->orderBy('id')
                ->get();

            foreach ($mediaRows as $media) {
                $from = $media->id.'/'.$media->file_name;
                $ext = pathinfo($media->file_name, PATHINFO_EXTENSION) ?: 'jpg';
                $collection = $media->collection_name;
                $dir = match ($collection) {
                    'cover' => 'cover',
                    'gallery_hidden' => 'gallery_hidden',
                    default => 'gallery',
                };
                $to = "projects/{$project->id}/{$dir}/".Str::uuid().'.'.$ext;

                try {
                    if (Storage::disk('public')->exists($from)) {
                        Storage::disk('public')->copy($from, $to);
                    } else {
                        $to = null;
                    }
                } catch (\Throwable) {
                    $to = null;
                }

                if (! $to) {
                    continue;
                }

                if ($collection === 'cover') {
                    $cover = $to;
                } elseif ($collection === 'gallery_hidden') {
                    $galleryHidden[] = $to;
                } else {
                    $gallery[] = $to;
                }
            }

            DB::table('projects')->where('id', $project->id)->update([
                'name' => $project->title,
                'category_id' => $categoryId,
                'location_id' => $locationId,
                'cover_image' => $cover,
                'gallery_images' => $gallery ? json_encode($gallery) : null,
                'gallery_hidden' => $galleryHidden ? json_encode($galleryHidden) : null,
            ]);

            DB::table('media')
                ->where('model_type', 'App\\Models\\Project')
                ->where('model_id', $project->id)
                ->delete();
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['title', 'location', 'type', 'year', 'category']);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('title')->nullable()->after('slug');
            $table->string('location')->nullable();
            $table->string('type')->nullable();
            $table->string('year')->nullable();
            $table->string('category')->nullable();
        });

        $categories = DB::table('categories')->get()->keyBy('id');
        $locations = DB::table('locations')->get()->keyBy('id');

        foreach (DB::table('projects')->get() as $project) {
            DB::table('projects')->where('id', $project->id)->update([
                'title' => $project->name,
                'category' => $project->category_id && isset($categories[$project->category_id])
                    ? $categories[$project->category_id]->slug
                    : null,
                'location' => $project->location_id && isset($locations[$project->location_id])
                    ? $locations[$project->location_id]->name
                    : null,
            ]);
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['location_id']);
            $table->dropColumn([
                'name',
                'category_id',
                'location_id',
                'studio',
                'cover_image',
                'gallery_images',
                'gallery_hidden',
                'canonical_url',
                'schema_json',
            ]);
        });
    }
};
