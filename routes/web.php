<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\ArticleController;
use App\Http\Controllers\Public\CollectionController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\MediaController;
use App\Http\Controllers\Public\ProjectController;
use App\Http\Controllers\Public\ResidentialController;
use App\Http\Controllers\Public\ServiceController;
use App\Http\Controllers\Public\SitemapController;
use App\Http\Controllers\Public\ThankYouController;
use App\Http\Controllers\Public\WorksController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/works', WorksController::class)->name('works');
Route::get('/works/{slug}', [ProjectController::class, 'show'])->name('works.show');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');
// Legacy SEO service URLs kept at site root (WordPress parity)
Route::get('/{slug}', [ServiceController::class, 'show'])
    ->where('slug', 'interior-fit-out-company-dubai|villa-renovation-dubai|home-renovation-in-dubai|kitchen-renovation-dubai|pool-garden-landscape-design-dubai|interior-design-office-fit-out|retail-interior-design-fit-out-dubai')
    ->name('services.seo');
Route::get('/media', MediaController::class)->name('media');
Route::get('/media/{slug}', [ArticleController::class, 'show'])->name('articles.show');
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/collection', CollectionController::class)->name('collection');
Route::get('/about', AboutController::class)->name('about');
Route::get('/residential', ResidentialController::class)->name('residential');
Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('contact.store');
Route::get('/thank-you', ThankYouController::class)->name('thank-you');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

Route::redirect('/dashboard', '/admin')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
