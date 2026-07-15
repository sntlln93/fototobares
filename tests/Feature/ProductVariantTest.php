<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\ProductType;

use function Pest\Laravel\post;

it('creates a product with valid variant definitions', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'banda')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Banda personalizada',
        'unit_price' => 9000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Talle', 'type' => 'text', 'nullable' => true, 'options' => [
                ['label' => 'Único'],
                ['label' => 'S'],
            ]],
            ['label' => 'Color', 'type' => 'color', 'nullable' => false, 'options' => [
                ['label' => 'Negro', 'color' => '#000000'],
            ]],
        ],
    ])->assertSessionHasNoErrors();

    $product = Product::where('name', 'Banda personalizada')->firstOrFail();

    expect($product->variants)->toHaveCount(2)
        ->and($product->variants[0]['label'])->toBe('Talle')
        ->and($product->variants[1]['options'][0]['color'])->toBe('#000000');
});

it('creates a product without variants', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Taza lisa',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => null,
    ])->assertSessionHasNoErrors();

    expect(Product::where('name', 'Taza lisa')->firstOrFail()->variants)->toBeNull();
});

it('requires a label for every variant definition', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto sin label',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['type' => 'text', 'nullable' => false, 'options' => [['label' => 'Único']]],
        ],
    ])->assertSessionHasErrors('variants.0.label');
});

it('rejects duplicate variant labels on the same product', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto con labels repetidos',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Talle', 'type' => 'text', 'nullable' => false, 'options' => [['label' => 'Único']]],
            ['label' => 'Talle', 'type' => 'text', 'nullable' => false, 'options' => [['label' => 'S']]],
        ],
    ])->assertSessionHasErrors();
});

it('rejects a variant type outside text or color', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto con tipo inválido',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Talle', 'type' => 'number', 'nullable' => false, 'options' => [['label' => 'Único']]],
        ],
    ])->assertSessionHasErrors('variants.0.type');
});

it('requires at least one option per variant definition', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto sin opciones',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Talle', 'type' => 'text', 'nullable' => false, 'options' => []],
        ],
    ])->assertSessionHasErrors('variants.0.options');
});

it('requires a color for options of a color variant', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto con color sin hex',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Color', 'type' => 'color', 'nullable' => false, 'options' => [['label' => 'Negro']]],
        ],
    ])->assertSessionHasErrors('variants.0.options.0.color');
});

it('does not require a color for options of a text variant', function () {
    actingAsRole(UserRole::Admin);

    $type = ProductType::where('name', 'taza')->firstOrFail();

    post(route('products.store'), [
        'name' => 'Producto con talle',
        'unit_price' => 8000,
        'max_payments' => 1,
        'product_type_id' => $type->id,
        'variants' => [
            ['label' => 'Talle', 'type' => 'text', 'nullable' => false, 'options' => [['label' => 'Único']]],
        ],
    ])->assertSessionHasNoErrors();
});
