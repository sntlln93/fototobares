<?php

declare(strict_types=1);

use App\Models\Combo;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

it('opens the edit page exposing pivot quantity and variants', function () {
    actingAsRole();

    $product = Product::factory()->mural()->create();

    $combo = Combo::create([
        'name' => 'Combo test',
        'suggested_price' => 64000,
        'suggested_max_payments' => 4,
    ]);

    $combo->products()->attach($product->id, [
        'quantity' => 2,
        'subtract_value' => 2000,
        'variants' => ['orientations' => ['vertical']],
    ]);

    // Regression: quantity was missing from withPivot and strict mode
    // turned the resource access into a 500
    get(route('combos.edit', $combo))->assertInertia(
        fn (Assert $page) => $page
            ->component('combos/edit')
            ->where('combo.data.products.0.quantity', 2)
            ->where('combo.data.products.0.subtract_value', 2000)
            ->where('combo.data.products.0.variants.orientations.0', 'vertical'),
    );
});

it('stores variants encoded once and returns them as an array', function () {
    actingAsRole();

    $product = Product::factory()->mural()->create();

    // Regression: the controller json_encoded variants that the pivot cast
    // encoded again, leaving double-encoded JSON in the database
    \Pest\Laravel\post(route('combos.store'), [
        'name' => 'Combo roundtrip',
        'suggested_price' => 64000,
        'suggested_max_payments' => 4,
        'products' => [
            [
                'id' => $product->id,
                'quantity' => 1,
                'subtract_value' => 0,
                'variants' => ['orientations' => ['horizontal']],
            ],
        ],
    ])->assertSessionHasNoErrors();

    $combo = Combo::where('name', 'Combo roundtrip')->firstOrFail();

    get(route('combos.edit', $combo))->assertInertia(
        fn (Assert $page) => $page->where(
            'combo.data.products.0.variants.orientations.0',
            'horizontal',
        ),
    );
});

it('updates a combo keeping quantities', function () {
    actingAsRole();

    $product = Product::factory()->create();

    $combo = Combo::create([
        'name' => 'Combo test',
        'suggested_price' => 64000,
        'suggested_max_payments' => 4,
    ]);

    $combo->products()->attach($product->id, ['quantity' => 1, 'subtract_value' => 0]);

    \Pest\Laravel\put(route('combos.update', $combo), [
        'name' => 'Combo renombrado',
        'suggested_price' => 70000,
        'suggested_max_payments' => 4,
        'products' => [
            ['id' => $product->id, 'quantity' => 3, 'subtract_value' => 5000],
        ],
    ])->assertSessionHasNoErrors();

    expect($combo->refresh()->name)->toBe('Combo renombrado')
        ->and($combo->products()->first()?->pivot?->quantity)->toBe(3)
        ->and($combo->products()->first()?->pivot?->subtract_value)->toBe(5000);
});

it('requires a subtract value for every product of the combo', function () {
    actingAsRole();

    $product = Product::factory()->create();

    \Pest\Laravel\post(route('combos.store'), [
        'name' => 'Combo sin resta',
        'suggested_price' => 64000,
        'suggested_max_payments' => 4,
        'products' => [
            ['id' => $product->id, 'quantity' => 1],
        ],
    ])->assertSessionHasErrors('products.0.subtract_value');
});

it('rejects a negative subtract value', function () {
    actingAsRole();

    $product = Product::factory()->create();

    \Pest\Laravel\post(route('combos.store'), [
        'name' => 'Combo resta negativa',
        'suggested_price' => 64000,
        'suggested_max_payments' => 4,
        'products' => [
            ['id' => $product->id, 'quantity' => 1, 'subtract_value' => -1],
        ],
    ])->assertSessionHasErrors('products.0.subtract_value');
});
