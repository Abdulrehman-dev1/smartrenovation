<?php

use App\Support\RepairArticleCovers;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Backfill empty article covers (e.g. Home Extensions blank Media tile).
     */
    public function up(): void
    {
        app(RepairArticleCovers::class)->run();
    }

    public function down(): void
    {
        // Irreversible data repair.
    }
};
