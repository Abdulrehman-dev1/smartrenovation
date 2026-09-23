<?php

use App\Support\ProjectTaxonomy;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $allowed = array_flip(ProjectTaxonomy::imageRooms());

        DB::table('projects')->orderBy('id')->chunkById(50, function ($projects) use ($allowed) {
            foreach ($projects as $project) {
                $gallery = $this->normalizeField($project->gallery_images, $allowed);
                $hidden = $this->normalizeField($project->gallery_hidden, $allowed);
                $rooms = collect($gallery)
                    ->pluck('room')
                    ->filter(fn (string $room) => $room !== ProjectTaxonomy::OTHER_ROOM)
                    ->unique()
                    ->values()
                    ->all();

                DB::table('projects')->where('id', $project->id)->update([
                    'gallery_images' => json_encode($gallery),
                    'gallery_hidden' => json_encode($hidden),
                    'rooms' => json_encode($rooms),
                ]);
            }
        });
    }

    public function down(): void
    {
        DB::table('projects')->orderBy('id')->chunkById(50, function ($projects) {
            foreach ($projects as $project) {
                DB::table('projects')->where('id', $project->id)->update([
                    'gallery_images' => json_encode($this->pathsOnly($project->gallery_images)),
                    'gallery_hidden' => json_encode($this->pathsOnly($project->gallery_hidden)),
                ]);
            }
        });
    }

    /**
     * @param  array<string, int>  $allowed
     * @return list<array{path: string, room: string}>
     */
    private function normalizeField(mixed $raw, array $allowed): array
    {
        $items = $this->decode($raw);
        $out = [];

        foreach ($items as $item) {
            if (is_string($item) && $item !== '') {
                $out[] = ['path' => $item, 'room' => ProjectTaxonomy::OTHER_ROOM];
                continue;
            }

            if (! is_array($item)) {
                continue;
            }

            $path = $item['path'] ?? null;
            if (! is_string($path) || $path === '') {
                continue;
            }

            $room = $item['room'] ?? ProjectTaxonomy::OTHER_ROOM;
            if (! is_string($room) || ! isset($allowed[$room])) {
                $room = ProjectTaxonomy::OTHER_ROOM;
            }

            $out[] = ['path' => $path, 'room' => $room];
        }

        return $out;
    }

    /**
     * @return list<string>
     */
    private function pathsOnly(mixed $raw): array
    {
        $items = $this->decode($raw);
        $out = [];

        foreach ($items as $item) {
            if (is_string($item) && $item !== '') {
                $out[] = $item;
            } elseif (is_array($item) && is_string($item['path'] ?? null) && $item['path'] !== '') {
                $out[] = $item['path'];
            }
        }

        return $out;
    }

    /**
     * @return list<mixed>
     */
    private function decode(mixed $raw): array
    {
        if (is_array($raw)) {
            return $raw;
        }

        if (! is_string($raw) || $raw === '') {
            return [];
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : [];
    }
};
