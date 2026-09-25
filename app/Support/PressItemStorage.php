<?php

namespace App\Support;

use App\Models\PressItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PressItemStorage
{
    public function storeCover(PressItem $item, UploadedFile $file): string
    {
        if ($item->cover_image) {
            $this->deletePath($item->cover_image);
        }

        $path = $this->storeFile($item, $file, 'cover', optimize: true);
        $item->forceFill(['cover_image' => $path])->save();

        return $path;
    }

    public function clearCover(PressItem $item): void
    {
        if ($item->cover_image) {
            $this->deletePath($item->cover_image);
        }
        $item->forceFill(['cover_image' => null])->save();
    }

    public function storePdf(PressItem $item, UploadedFile $file): string
    {
        if ($item->pdf_path) {
            $this->deletePath($item->pdf_path);
        }

        $path = $this->storeFile($item, $file, 'pdf', optimize: false);
        $item->forceFill(['pdf_path' => $path])->save();

        return $path;
    }

    public function clearPdf(PressItem $item): void
    {
        if ($item->pdf_path) {
            $this->deletePath($item->pdf_path);
        }
        $item->forceFill(['pdf_path' => null])->save();
    }

    public function deleteAll(PressItem $item): void
    {
        if ($item->cover_image) {
            $this->deletePath($item->cover_image);
        }
        if ($item->pdf_path) {
            $this->deletePath($item->pdf_path);
        }

        Storage::disk('public')->deleteDirectory('press/'.$item->id);
    }

    private function storeFile(PressItem $item, UploadedFile $file, string $folder, bool $optimize): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $name = Str::uuid()->toString().'.'.$ext;
        $directory = "press/{$item->id}/{$folder}";
        $path = $file->storeAs($directory, $name, 'public');

        if ($optimize) {
            $this->optimizeInPlace($path);
        }

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
