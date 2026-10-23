<?php

namespace App\Console\Commands;

use App\Support\RepairArticleCovers;
use Illuminate\Console\Command;

class RepairArticleCoversCommand extends Command
{
    protected $signature = 'smart:repair-article-covers';

    protected $description = 'Backfill empty article cover_image values from storage or bundled public assets';

    public function handle(RepairArticleCovers $repair): int
    {
        $count = $repair->run();
        $this->info("Repaired {$count} article cover(s).");

        return self::SUCCESS;
    }
}
