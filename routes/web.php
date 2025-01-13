<?php

use App\Http\Controllers\BO\SchoolController;
use App\Http\Controllers\BO\StockController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/products', function () {
    return Inertia::render('products.index');
})->middleware(['auth', 'verified'])->name('products.index');

Route::get('/orders', function () {
    return Inertia::render('orders.index');
})->middleware(['auth', 'verified'])->name('orders.index');

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
