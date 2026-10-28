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
        $previous = $project->cover_image;
        $path = $this->storeFile($project, $file, 'cover');
        $project->forceFill(['cover_image' => $path])->save();
        $project->pruneCollectionImages();

        if (is_string($previous) && $previous !== '' && $previous !== $path) {
            $this->deletePath($previous);
        }

        return $path;
    }

    /**
     * @param  list<UploadedFile>  $files
     * @param  list<string>|null  $rooms  Aligned with $files; missing entries default to Other
     * @param  list<UploadedFile|null>|null  $posters  Aligned with $files; required for video files
     * @return list<array{path: string, room: string, poster?: string}>
     */
    public function appendGallery(
        Project $project,
        array $files,
        string $field = 'gallery_images',
        ?array $rooms = null,
        ?array $posters = null
    ): array {
        $items = $project->normalizedGallery($field);
        $added = [];
        $allowed = array_flip(ProjectTaxonomy::imageRooms());
        $folder = $field === 'gallery_hidden' ? 'gallery_hidden' : 'gallery';

        foreach (array_values($files) as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $this->storeFile($project, $file, $folder);
            $room = $rooms[$index] ?? ProjectTaxonomy::OTHER_ROOM;
            if (! is_string($room) || ! isset($allowed[$room])) {
                $room = ProjectTaxonomy::OTHER_ROOM;
            }
            $item = ['path' => $path, 'room' => $room];

            $poster = $posters[$index] ?? null;
            if (ProjectMedia::isVideoPath($path)) {
                if (! $poster instanceof UploadedFile) {
                    $this->deletePath($path);
                    throw new \InvalidArgumentException('Videos require a cover image.');
                }
                $item['poster'] = $this->storeFile($project, $poster, $folder.'/posters');
            } elseif ($poster instanceof UploadedFile) {
                $item['poster'] = $this->storeFile($project, $poster, $folder.'/posters');
            }

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
        $items = $project->normalizedGallery($field);
        $poster = null;
        foreach ($items as $item) {
            if ($item['path'] === $path) {
                $poster = $item['poster'] ?? null;
                break;
            }
        }

        $remaining = collect($items)
            ->reject(fn (array $item) => $item['path'] === $path)
            ->values()
            ->all();
        $this->deletePath($path);
        if (is_string($poster) && $poster !== '') {
            $this->deletePath($poster);
        }
        $project->forceFill([$field => $remaining])->save();
        if ($field === 'gallery_images') {
            $project->syncRoomsFromGallery();
            $project->pruneCollectionImages();
        }
    }

    public function clearCover(Project $project): void
    {
        if ($project->cover_image) {
            $this->deletePath($project->cover_image);
        }
        $project->forceFill(['cover_image' => null])->save();
        $project->pruneCollectionImages();
    }

    /**
     * Promote a gallery image to cover; previous cover takes its place in the same collection.
     * Files stay on disk — only database references are swapped.
     *
     * @throws \InvalidArgumentException When the path is not in the given gallery field.
     */
    public function promoteToCover(Project $project, string $path, string $field = 'gallery_images'): void
    {
        $items = $project->normalizedGallery($field);
        $index = null;
        $promoted = null;

        foreach ($items as $i => $item) {
            if ($item['path'] === $path) {
                $index = $i;
                $promoted = $item;
                break;
            }
        }

        if ($promoted === null || $index === null) {
            throw new \InvalidArgumentException('Image not found in gallery.');
        }

        if (ProjectMedia::isVideoPath($path)) {
            throw new \InvalidArgumentException('Videos cannot be used as the cover image.');
        }

        $previousCover = $project->cover_image;
        array_splice($items, $index, 1);

        if (is_string($previousCover) && $previousCover !== '') {
            array_splice($items, $index, 0, [[
                'path' => $previousCover,
                'room' => $promoted['room'] ?? ProjectTaxonomy::OTHER_ROOM,
            ]]);
        }

        $project->forceFill([
            'cover_image' => $promoted['path'],
            $field => array_values($items),
        ])->save();

        $project->syncRoomsFromGallery();
        $project->pruneCollectionImages();
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
        $project->pruneCollectionImages();
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
        if (! is_string($path) || $path === '') {
            throw new \RuntimeException('Failed to store project image.');
        }

        $this->optimizeInPlace($path);

        return $path;
    }

    private function optimizeInPlace(string $path): void
    {
        if (ProjectMedia::isVideoPath($path)) {
            return;
        }

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
