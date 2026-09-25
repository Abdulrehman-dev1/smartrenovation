<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('press_items')) {
            return;
        }

        Schema::table('press_items', function (Blueprint $table) {
            $drop = [];
            if (Schema::hasColumn('press_items', 'sort_order')) {
                $drop[] = 'sort_order';
            }
            if (Schema::hasColumn('press_items', 'published_at')) {
                $drop[] = 'published_at';
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('press_items')) {
            return;
        }

        Schema::table('press_items', function (Blueprint $table) {
            if (! Schema::hasColumn('press_items', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('status');
            }
            if (! Schema::hasColumn('press_items', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('sort_order');
            }
        });
    }
};
