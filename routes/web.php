<?php

declare(strict_types=1);

use App\Http\Controllers\BO\ClassroomController;
use App\Http\Controllers\BO\ComboController;
use App\Http\Controllers\BO\OrderController;
use App\Http\Controllers\BO\PaymentController;
use App\Http\Controllers\BO\ProductController;
use App\Http\Controllers\BO\SchoolController;
use App\Http\Controllers\BO\StockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::resource('products', ProductController::class)->middleware(['auth']);
Route::resource('combos', ComboController::class)->middleware(['auth']);
Route::resource('orders', OrderController::class)->middleware(['auth']);
Route::resource('schools', SchoolController::class)->middleware(['auth']);

Route::get('/tracking', function () {
    return Inertia::render('tracking.index');
})->middleware(['auth', 'verified'])->name('tracking.index');

Route::resource('stockables', StockController::class)->middleware(['auth']);
Route::resource('classrooms', ClassroomController::class)->only(['destroy', 'update', 'store'])->middleware(['auth']);

Route::group(['prefix' => 'payments'], function () {
    Route::post('/', [PaymentController::class, 'store'])->name('payments.store');
    Route::put('/{payment}', [PaymentController::class, 'update'])->name('payments.update');
})->middleware(['auth']);

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
