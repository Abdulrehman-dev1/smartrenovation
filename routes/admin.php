<?php

use App\Http\Controllers\Admin\ArticleController;
use App\Http\Controllers\Admin\AwardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CollectionItemController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\MediaUploadController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\RedirectController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\ServiceImageController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::middleware('throttle:60,1')->group(function () {
            Route::resource('projects', ProjectController::class);
            Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
            Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
            Route::post('locations', [LocationController::class, 'store'])->name('locations.store');
            Route::put('locations/{location}', [LocationController::class, 'update'])->name('locations.update');
            Route::delete('locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
            Route::post('projects/{project}/images', [\App\Http\Controllers\Admin\ProjectImageController::class, 'store'])
                ->name('projects.images.store');
            Route::delete('projects/{project}/images', [\App\Http\Controllers\Admin\ProjectImageController::class, 'destroy'])
                ->name('projects.images.destroy');
            Route::post('projects/{project}/images/reorder', [\App\Http\Controllers\Admin\ProjectImageController::class, 'reorder'])
                ->name('projects.images.reorder');
            Route::post('projects/{project}/images/transfer', [\App\Http\Controllers\Admin\ProjectImageController::class, 'transfer'])
                ->name('projects.images.transfer');
            Route::post('projects/{project}/images/rooms', [\App\Http\Controllers\Admin\ProjectImageController::class, 'updateRooms'])
                ->name('projects.images.rooms');
            Route::resource('services', ServiceController::class);
            Route::post('services/{service}/images', [ServiceImageController::class, 'store'])
                ->name('services.images.store');
            Route::delete('services/{service}/images', [ServiceImageController::class, 'destroy'])
                ->name('services.images.destroy');
            Route::post('services/{service}/images/reorder', [ServiceImageController::class, 'reorder'])
                ->name('services.images.reorder');
            Route::resource('articles', ArticleController::class)->except(['show']);
            Route::resource('collection-items', CollectionItemController::class)
                ->parameters(['collection-items' => 'collection_item'])
                ->except(['show']);
            Route::resource('awards', AwardController::class)->except(['show']);
            Route::resource('pages', PageController::class)->except(['show']);
            Route::resource('redirects', RedirectController::class)->except(['show']);

            Route::get('leads', [LeadController::class, 'index'])->name('leads.index');
            Route::get('leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
            Route::delete('leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');

            Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
            Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

            Route::get('media-tester', [MediaUploadController::class, 'tester'])->name('media-tester');
            Route::post('media', [MediaUploadController::class, 'store'])->name('media.store');
            Route::post('media-tester', [MediaUploadController::class, 'store'])->name('media-tester.store');
            Route::post('media/reorder', [MediaUploadController::class, 'reorder'])->name('media.reorder');
            Route::get('media/{media}/status', [MediaUploadController::class, 'status'])->name('media.status');
            Route::delete('media/{media}', [MediaUploadController::class, 'destroy'])->name('media.destroy');

            Route::post('editor-uploads', [\App\Http\Controllers\Admin\EditorUploadController::class, 'store'])
                ->name('editor-uploads.store');
        });
    });
