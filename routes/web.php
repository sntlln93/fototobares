<?php

use App\Http\Controllers\BO\ComboController;
use App\Http\Controllers\BO\OrderController;
use App\Http\Controllers\BO\ProductController;
use App\Http\Controllers\BO\SchoolController;
use App\Http\Controllers\BO\StockController;
use App\Http\Controllers\ProfileController;
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
