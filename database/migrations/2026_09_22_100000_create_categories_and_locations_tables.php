<?php

use App\Support\ProjectTaxonomy;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Allow re-run after a partial failure (tables created, seed insert failed).
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('type_label')->nullable();
            $table->timestamps();
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->timestamps();
        });

        $now = now();
        foreach (ProjectTaxonomy::categories() as $slug => $name) {
            DB::table('categories')->insert([
                'slug' => $slug,
                'name' => $name,
                'type_label' => ProjectTaxonomy::typeLabels()[$slug] ?? $name,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $usedSlugs = [];
        foreach (ProjectTaxonomy::locations() as $name) {
            $base = Str::slug($name) ?: 'location';
            $slug = $base;
            $i = 2;
            while (isset($usedSlugs[$slug])) {
                $slug = $base.'-'.$i;
                $i++;
            }
            $usedSlugs[$slug] = true;

            DB::table('locations')->insert([
                'slug' => $slug,
                'name' => $name,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');
    }
};
