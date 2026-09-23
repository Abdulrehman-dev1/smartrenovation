<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'nav_label')) {
                $table->dropColumn('nav_label');
            }
            if (Schema::hasColumn('services', 'hero_title')) {
                $table->dropColumn('hero_title');
            }
            if (Schema::hasColumn('services', 'blocks')) {
                $table->dropColumn('blocks');
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (! Schema::hasColumn('services', 'title')) {
                $table->string('title')->after('slug');
            }
            if (! Schema::hasColumn('services', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('title');
            }
            if (! Schema::hasColumn('services', 'short_description')) {
                $table->text('short_description')->nullable()->after('subtitle');
            }
            if (! Schema::hasColumn('services', 'description')) {
                $table->longText('description')->nullable()->after('short_description');
            }
            if (! Schema::hasColumn('services', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('description');
            }
            if (! Schema::hasColumn('services', 'gallery_images')) {
                $table->json('gallery_images')->nullable()->after('cover_image');
            }
            if (! Schema::hasColumn('services', 'canonical_url')) {
                $table->string('canonical_url', 2048)->nullable()->after('meta_description');
            }
            if (! Schema::hasColumn('services', 'schema_json')) {
                $table->longText('schema_json')->nullable()->after('canonical_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            foreach ([
                'title',
                'subtitle',
                'short_description',
                'description',
                'cover_image',
                'gallery_images',
                'canonical_url',
                'schema_json',
            ] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('nav_label')->nullable();
            $table->string('hero_title')->nullable();
            $table->json('blocks')->nullable();
        });
    }
};
