<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (! Schema::hasColumn('services', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0)->after('status');
                $table->index('sort_order');
            }
            if (! Schema::hasColumn('services', 'cta_label')) {
                $table->string('cta_label')->nullable()->after('subtitle');
            }
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            if (Schema::hasColumn('services', 'cta_label')) {
                $table->dropColumn('cta_label');
            }
            if (Schema::hasColumn('services', 'sort_order')) {
                $table->dropIndex(['sort_order']);
                $table->dropColumn('sort_order');
            }
        });
    }
};
