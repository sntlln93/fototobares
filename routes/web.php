<?php

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

Route::get('/schools', function () {
    return Inertia::render('schools.index');
})->middleware(['auth', 'verified'])->name('schools.index');

Route::get('/tracking', function () {
    return Inertia::render('tracking.index');
})->middleware(['auth', 'verified'])->name('tracking.index');

Route::get('/stock', function () {
    return Inertia::render('stock.index');
})->middleware(['auth', 'verified'])->name('stock.index');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
