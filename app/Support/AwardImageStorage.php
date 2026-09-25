<?php

namespace App\Support;

use App\Models\Award;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AwardImageStorage
{
    public function storeCover(Award $award, UploadedFile $file): string
    {
        if ($award->cover_image) {
            $this->deletePath($award->cover_image);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $name = Str::uuid()->toString().'.'.$ext;
        $directory = "awards/{$award->id}/cover";
        $path = $file->storeAs($directory, $name, 'public');

        $this->optimizeInPlace($path);
        $award->forceFill(['cover_image' => $path])->save();

        return $path;
    }

    public function clearCover(Award $award): void
    {
        if ($award->cover_image) {
            $this->deletePath($award->cover_image);
        }
        $award->forceFill(['cover_image' => null])->save();
    }

    public function deleteAll(Award $award): void
    {
        if ($award->cover_image) {
            $this->deletePath($award->cover_image);
        }

        Storage::disk('public')->deleteDirectory('awards/'.$award->id);
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
