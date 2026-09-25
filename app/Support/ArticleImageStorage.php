<?php

namespace App\Support;

use App\Models\Article;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleImageStorage
{
    public function storeCover(Article $article, UploadedFile $file): string
    {
        if ($article->cover_image) {
            $this->deletePath($article->cover_image);
        }

        $path = $this->storeFile($article, $file, 'cover');
        $article->forceFill(['cover_image' => $path])->save();

        return $path;
    }

    public function clearCover(Article $article): void
    {
        if ($article->cover_image) {
            $this->deletePath($article->cover_image);
        }
        $article->forceFill(['cover_image' => null])->save();
    }

    public function deleteAll(Article $article): void
    {
        if ($article->cover_image) {
            $this->deletePath($article->cover_image);
        }

        Storage::disk('public')->deleteDirectory('articles/'.$article->id);
    }

    private function storeFile(Article $article, UploadedFile $file, string $folder): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        $name = Str::uuid()->toString().'.'.$ext;
        $directory = "articles/{$article->id}/{$folder}";
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
