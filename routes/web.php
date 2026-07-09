<?php

declare(strict_types=1);

use App\Http\Controllers\BO\ClassroomController;
use App\Http\Controllers\BO\ComboController;
use App\Http\Controllers\BO\DashboardController;
use App\Http\Controllers\BO\DeliveryController;
use App\Http\Controllers\BO\OrderController;
use App\Http\Controllers\BO\OrderDraftController;
use App\Http\Controllers\BO\PaymentController;
use App\Http\Controllers\BO\PhotoController;
use App\Http\Controllers\BO\ProductController;
use App\Http\Controllers\BO\ProductionStatusController;
use App\Http\Controllers\BO\RecyclingController;
use App\Http\Controllers\BO\SchoolController;
use App\Http\Controllers\BO\StockController;
use App\Http\Controllers\BO\StockMovementController;
use App\Http\Controllers\BO\TrackingController;
use App\Http\Controllers\BO\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Día a día de ventas: gerencia, administración y oficina
Route::middleware(['auth', 'role:master,administración,oficina'])->group(function () {
    Route::resource('products', ProductController::class);
    Route::resource('combos', ComboController::class);
    Route::resource('orders', OrderController::class);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::put('/orders/{order}/delivery', [DeliveryController::class, 'update'])->name('orders.delivery');
    Route::resource('drafts', OrderDraftController::class)->only(['index', 'store', 'destroy']);
    Route::resource('schools', SchoolController::class);
    Route::resource('classrooms', ClassroomController::class)->only(['destroy', 'update', 'store', 'show']);

    Route::prefix('payments')->group(function () {
        Route::post('/', [PaymentController::class, 'store'])->name('payments.store');
        Route::put('/{payment}', [PaymentController::class, 'update'])->name('payments.update');
    });
});

// Fotos: también accesibles para el rol editor
Route::middleware(['auth', 'role:master,administración,oficina,editor'])->group(function () {
    Route::get('/classrooms/{classroom}/photos', [PhotoController::class, 'index'])->name('photos.index');
    Route::post('/classrooms/{classroom}/photos', [PhotoController::class, 'store'])->name('photos.store');
    Route::delete('/photos/{photo}', [PhotoController::class, 'destroy'])->name('photos.destroy');
});

// Producción y stock: también accesibles para el rol taller
Route::middleware(['auth', 'role:master,administración,oficina,taller'])->group(function () {
    Route::get('/tracking', [TrackingController::class, 'index'])->name('tracking.index');
    Route::post('/tracking/batch', [TrackingController::class, 'batchUpdate'])->name('tracking.batch');
    Route::resource('stockables', StockController::class);
    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
    Route::get('/recycling', [RecyclingController::class, 'index'])->name('recycling.index');
});

// Etapas de producción por tipo de producto: solo gerencia
Route::middleware(['auth', 'role:master,administración'])->group(function () {
    Route::get('/production-statuses', [ProductionStatusController::class, 'index'])->name('production-statuses.index');
    Route::post('/production-statuses', [ProductionStatusController::class, 'store'])->name('production-statuses.store');
    Route::put('/production-statuses/reorder', [ProductionStatusController::class, 'reorder'])->name('production-statuses.reorder');
    Route::put('/production-statuses/{productionStatus}', [ProductionStatusController::class, 'update'])->name('production-statuses.update');
    Route::delete('/production-statuses/{productionStatus}', [ProductionStatusController::class, 'destroy'])->name('production-statuses.destroy');
});

// Gestión de usuarios: solo gerencia
Route::middleware(['auth', 'role:master'])->group(function () {
    Route::resource('users', UserController::class)->except(['show']);
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
