<?php

namespace App\Support;

use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectImageStorage
{
    public function storeCover(Project $project, UploadedFile $file): string
    {
        if ($project->cover_image) {
            $this->deletePath($project->cover_image);
        }

        $path = $this->storeFile($project, $file, 'cover');
        $project->forceFill(['cover_image' => $path])->save();

        return $path;
    }

    /**
     * @param  list<UploadedFile>  $files
     * @param  list<string>|null  $rooms  Aligned with $files; missing entries default to Other
     * @return list<array{path: string, room: string}>
     */
    public function appendGallery(
        Project $project,
        array $files,
        string $field = 'gallery_images',
        ?array $rooms = null
    ): array {
        $items = $project->normalizedGallery($field);
        $added = [];
        $allowed = array_flip(ProjectTaxonomy::imageRooms());

        foreach (array_values($files) as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $this->storeFile($project, $file, $field === 'gallery_hidden' ? 'gallery_hidden' : 'gallery');
            $room = $rooms[$index] ?? ProjectTaxonomy::OTHER_ROOM;
            if (! is_string($room) || ! isset($allowed[$room])) {
                $room = ProjectTaxonomy::OTHER_ROOM;
            }
            $item = ['path' => $path, 'room' => $room];
            $items[] = $item;
            $added[] = $item;
        }

        $project->forceFill([$field => array_values($items)])->save();
        if ($field === 'gallery_images') {
            $project->syncRoomsFromGallery();
        }

        return $added;
    }

    public function removePath(Project $project, string $path, string $field): void
    {
        $items = collect($project->normalizedGallery($field))
            ->reject(fn (array $item) => $item['path'] === $path)
            ->values()
            ->all();
        $this->deletePath($path);
        $project->forceFill([$field => $items])->save();
        if ($field === 'gallery_images') {
            $project->syncRoomsFromGallery();
        }
    }

    public function clearCover(Project $project): void
    {
        if ($project->cover_image) {
            $this->deletePath($project->cover_image);
        }
        $project->forceFill(['cover_image' => null])->save();
    }

    /**
     * @param  list<string>  $orderedPaths
     */
    public function reorder(Project $project, string $field, array $orderedPaths): void
    {
        $byPath = collect($project->normalizedGallery($field))->keyBy('path');
        $ordered = [];

        foreach ($orderedPaths as $path) {
            if (! is_string($path) || ! $byPath->has($path)) {
                continue;
            }
            $ordered[] = $byPath->get($path);
            $byPath->forget($path);
        }

        foreach ($byPath as $item) {
            $ordered[] = $item;
        }

        $project->forceFill([$field => array_values($ordered)])->save();
    }

    /**
     * Move selected paths from one gallery field to another (no file delete). Preserves room tags.
     *
     * @param  list<string>  $paths
     */
    public function transfer(Project $project, string $fromField, string $toField, array $paths): void
    {
        $from = $project->normalizedGallery($fromField);
        $to = $project->normalizedGallery($toField);
        $toPaths = collect($to)->pluck('path')->all();
        $moving = [];
        $pathSet = array_flip($paths);

        $fromRemaining = [];
        foreach ($from as $item) {
            if (isset($pathSet[$item['path']])) {
                $moving[] = $item;
            } else {
                $fromRemaining[] = $item;
            }
        }

        if ($moving === []) {
            return;
        }

        foreach ($moving as $item) {
            if (! in_array($item['path'], $toPaths, true)) {
                $to[] = $item;
                $toPaths[] = $item['path'];
            }
        }

        $project->forceFill([
            $fromField => array_values($fromRemaining),
            $toField => array_values($to),
        ])->save();

        $project->syncRoomsFromGallery();
    }

    /**
     * @param  list<array{path: string, room: string}>  $updates
     */
    public function setRooms(Project $project, string $field, array $updates): void
    {
        $allowed = array_flip(ProjectTaxonomy::imageRooms());
        $map = [];
        foreach ($updates as $update) {
            $path = $update['path'] ?? null;
            $room = $update['room'] ?? null;
            if (! is_string($path) || $path === '' || ! is_string($room) || ! isset($allowed[$room])) {
                continue;
            }
            $map[$path] = $room;
        }

        if ($map === []) {
            return;
        }

        $items = $project->normalizedGallery($field);
        foreach ($items as $index => $item) {
            if (isset($map[$item['path']])) {
                $items[$index]['room'] = $map[$item['path']];
            }
        }

        $project->forceFill([$field => array_values($items)])->save();
        if ($field === 'gallery_images') {
            $project->syncRoomsFromGallery();
        }
    }

    public function deleteAll(Project $project): void
    {
        if ($project->cover_image) {
            $this->deletePath($project->cover_image);
        }
        foreach (array_merge(
            $project->normalizedGallery('gallery_images'),
            $project->normalizedGallery('gallery_hidden')
        ) as $item) {
            $this->deletePath($item['path']);
        }

        Storage::disk('public')->deleteDirectory('projects/'.$project->id);
    }

    private function storeFile(Project $project, UploadedFile $file, string $folder): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $name = Str::uuid()->toString().'.'.$ext;
        $directory = "projects/{$project->id}/{$folder}";
        $path = $file->storeAs($directory, $name, 'public');

        $this->optimizeInPlace($path);

        return $path;
    }

    private function optimizeInPlace(string $path): void
    {
        $full = Storage::disk('public')->path($path);
        if (! is_file($full) || ! function_exists('imagecreatefromstring')) {
            return;
        }

        $binary = @file_get_contents($full);
        if ($binary === false) {
            return;
        }

        $image = @imagecreatefromstring($binary);
        if ($image === false) {
            return;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $max = 1920;

        if ($width > $max || $height > $max) {
            $scale = min($max / $width, $max / $height);
            $newW = (int) max(1, round($width * $scale));
            $newH = (int) max(1, round($height * $scale));
            $resized = imagecreatetruecolor($newW, $newH);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newW, $newH, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg'], true)) {
            imagejpeg($image, $full, 85);
        } elseif ($ext === 'png') {
            imagepng($image, $full, 6);
        } elseif ($ext === 'webp' && function_exists('imagewebp')) {
            imagewebp($image, $full, 85);
        }

        imagedestroy($image);
    }

    private function deletePath(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
