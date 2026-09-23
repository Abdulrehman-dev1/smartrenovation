<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Support\ProjectTaxonomy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryLocationSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        foreach (ProjectTaxonomy::categories() as $slug => $name) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'type_label' => ProjectTaxonomy::typeLabels()[$slug] ?? $name,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        $locationSlugs = [];
        foreach (ProjectTaxonomy::locations() as $name) {
            $slug = $this->uniqueSlug($name, $locationSlugs);
            $locationSlugs[] = $slug;

            // Prefer match by exact name so renames of slug stay stable when possible.
            $existing = DB::table('locations')->where('name', $name)->first();
            if ($existing) {
                DB::table('locations')->where('id', $existing->id)->update([
                    'slug' => $slug,
                    'name' => $name,
                    'updated_at' => $now,
                ]);
            } else {
                DB::table('locations')->updateOrInsert(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }
        }

        // Drop old taxonomy locations that are no longer in the smart work__meta set.
        // projects.location_id is nullOnDelete.
        Location::query()
            ->whereNotIn('slug', $locationSlugs)
            ->delete();
    }

    /**
     * @param  list<string>  $taken
     */
    private function uniqueSlug(string $name, array $taken): string
    {
        $base = Str::slug($name) ?: 'location';
        $slug = $base;
        $i = 2;
        while (in_array($slug, $taken, true)) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
