<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('awards', function (Blueprint $table) {
            if (! Schema::hasColumn('awards', 'organization')) {
                $table->string('organization')->nullable()->after('title');
            }
            if (! Schema::hasColumn('awards', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('year');
            }
            if (! Schema::hasColumn('awards', 'status')) {
                $table->enum('status', ['draft', 'published'])->default('draft')->after('cover_image');
            }
        });

        if (Schema::hasColumn('awards', 'sort_order')) {
            Schema::table('awards', function (Blueprint $table) {
                $table->dropColumn('sort_order');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('awards', 'sort_order')) {
            Schema::table('awards', function (Blueprint $table) {
                $table->integer('sort_order')->default(0)->after('year');
            });
        }

        Schema::table('awards', function (Blueprint $table) {
            $drop = [];
            foreach (['organization', 'cover_image', 'status'] as $col) {
                if (Schema::hasColumn('awards', $col)) {
                    $drop[] = $col;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};
