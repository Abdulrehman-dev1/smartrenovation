<?php

use App\Support\ProjectSortOrder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Keep current display order (sort_order, then id), assign unique 1..N.
        ProjectSortOrder::renumber();
    }

    public function down(): void
    {
        // Irreversible data cleanup.
    }
};
