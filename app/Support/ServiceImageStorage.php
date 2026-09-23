<?php

namespace App\Support;

use App\Models\Service;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceImageStorage
{
    public function storeCover(Service $service, UploadedFile $file): string
    {
        if ($service->cover_image) {
            $this->deletePath($service->cover_image);
        }

        $path = $this->storeFile($service, $file, 'cover');
        $service->forceFill(['cover_image' => $path])->save();

        return $path;
    }

    /**
     * @param  list<UploadedFile>  $files
     * @return list<array{path: string}>
     */
    public function appendGallery(Service $service, array $files): array
    {
        $items = $service->normalizedGallery();
        $added = [];

        foreach (array_values($files) as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $path = $this->storeFile($service, $file, 'gallery');
            $item = ['path' => $path];
            $items[] = $item;
            $added[] = $item;
        }

        $service->forceFill(['gallery_images' => array_values($items)])->save();

        return $added;
    }

    public function removePath(Service $service, string $path): void
    {
        $items = collect($service->normalizedGallery())
            ->reject(fn (array $item) => $item['path'] === $path)
            ->values()
            ->all();
        $this->deletePath($path);
        $service->forceFill(['gallery_images' => $items])->save();
    }

    public function clearCover(Service $service): void
    {
        if ($service->cover_image) {
            $this->deletePath($service->cover_image);
        }
        $service->forceFill(['cover_image' => null])->save();
    }

    /**
     * @param  list<string>  $orderedPaths
     */
    public function reorder(Service $service, array $orderedPaths): void
    {
        $byPath = collect($service->normalizedGallery())->keyBy('path');
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

        $service->forceFill(['gallery_images' => array_values($ordered)])->save();
    }

    public function deleteAll(Service $service): void
    {
        if ($service->cover_image) {
            $this->deletePath($service->cover_image);
        }
        foreach ($service->normalizedGallery() as $item) {
            $this->deletePath($item['path']);
        }

        Storage::disk('public')->deleteDirectory('services/'.$service->id);
    }

    private function storeFile(Service $service, UploadedFile $file, string $folder): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $name = Str::uuid()->toString().'.'.$ext;
        $directory = "services/{$service->id}/{$folder}";
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
