<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('title');
            $table->string('cover_image')->nullable()->after('subtitle');
            $table->longText('description')->nullable()->after('cover_image');
            $table->string('canonical_url', 2048)->nullable()->after('meta_description');
            $table->longText('schema_json')->nullable()->after('canonical_url');
        });

        // Move old columns into new shape before dropping.
        if (Schema::hasColumn('articles', 'excerpt') || Schema::hasColumn('articles', 'body')) {
            $rows = DB::table('articles')->select('id', 'excerpt', 'body', 'published_on', 'published_at')->get();
            foreach ($rows as $row) {
                $publishedAt = $row->published_at;
                if (! $publishedAt && ! empty($row->published_on)) {
                    $publishedAt = $row->published_on.' 00:00:00';
                }

                DB::table('articles')->where('id', $row->id)->update([
                    'subtitle' => $row->excerpt,
                    'description' => $row->body,
                    'published_at' => $publishedAt,
                ]);
            }
        }

        Schema::table('articles', function (Blueprint $table) {
            if (Schema::hasColumn('articles', 'published_on')) {
                $table->dropColumn('published_on');
            }
            if (Schema::hasColumn('articles', 'excerpt')) {
                $table->dropColumn('excerpt');
            }
            if (Schema::hasColumn('articles', 'body')) {
                $table->dropColumn('body');
            }
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->date('published_on')->nullable()->after('title');
            $table->text('excerpt')->nullable()->after('published_on');
            $table->longText('body')->nullable()->after('excerpt');
        });

        $rows = DB::table('articles')->select('id', 'subtitle', 'description', 'published_at')->get();
        foreach ($rows as $row) {
            DB::table('articles')->where('id', $row->id)->update([
                'excerpt' => $row->subtitle,
                'body' => $row->description,
                'published_on' => $row->published_at ? substr((string) $row->published_at, 0, 10) : null,
            ]);
        }

        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn([
                'subtitle',
                'cover_image',
                'description',
                'canonical_url',
                'schema_json',
            ]);
        });
    }
};
