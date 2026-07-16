<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\post;
use function Pest\Laravel\put;

uses(RefreshDatabase::class);

it('creates a product with has_photo true', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'banda')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Banda con foto',
        'unit_price' => 9000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'has_photo' => true,
    ])->assertSessionHasNoErrors();

    $product = Product::where('name', 'Banda con foto')->firstOrFail();

    expect($product->has_photo)->toBe(true)
        ->and(is_bool($product->has_photo))->toBeTrue();
});

it('defaults has_photo to false when the field is omitted', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Taza sin foto',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
    ])->assertSessionHasNoErrors();

    $product = Product::where('name', 'Taza sin foto')->firstOrFail();

    expect($product->has_photo)->toBe(false);
});

it('creates a product with has_photo false', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'portaretrato')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Portaretrato sin foto',
        'unit_price' => 5000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'has_photo' => false,
    ])->assertSessionHasNoErrors();

    $product = Product::where('name', 'Portaretrato sin foto')->firstOrFail();

    expect($product->has_photo)->toBe(false);
});

it('updates has_photo on an existing product', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();
    $product = Product::factory()->create([
        'product_type_id' => $type->id,
        'has_photo' => false,
    ]);

    put(route('products.update', $product), [
        'name' => $product->name,
        'unit_price' => $product->unit_price,
        'max_payments' => $product->max_payments,
        'product_type_id' => $product->product_type_id,
        'has_photo' => true,
    ])->assertSessionHasNoErrors();

    expect($product->refresh()->has_photo)->toBe(true);

    put(route('products.update', $product), [
        'name' => $product->name,
        'unit_price' => $product->unit_price,
        'max_payments' => $product->max_payments,
        'product_type_id' => $product->product_type_id,
        'has_photo' => false,
    ])->assertSessionHasNoErrors();

    expect($product->refresh()->has_photo)->toBe(false);
});

it('rejects a non-boolean has_photo', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'banda')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Banda con foto inválida',
        'unit_price' => 9000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'has_photo' => 'maybe',
    ])->assertSessionHasErrors('has_photo');
});

it('exposes has_photo in the product resource', function () {
    $product = Product::factory()->create(['has_photo' => true]);

    $resource = (new ProductResource($product))->toArray(request());

    expect($resource)
        ->toHaveKey('has_photo')
        ->and($resource['has_photo'])->toBe(true);
});
