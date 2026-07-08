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
        'variants' => ['orientations' => ['vertical']],
    ]);

    // Regression: quantity was missing from withPivot and strict mode
    // turned the resource access into a 500
    get(route('combos.edit', $combo))->assertInertia(
        fn (Assert $page) => $page
            ->component('combos/edit')
            ->where('combo.data.products.0.quantity', 2)
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

    $combo->products()->attach($product->id, ['quantity' => 1]);

    \Pest\Laravel\put(route('combos.update', $combo), [
        'name' => 'Combo renombrado',
        'suggested_price' => 70000,
        'suggested_max_payments' => 4,
        'products' => [
            ['id' => $product->id, 'quantity' => 3],
        ],
    ])->assertSessionHasNoErrors();

    expect($combo->refresh()->name)->toBe('Combo renombrado')
        ->and($combo->products()->first()?->pivot?->quantity)->toBe(3);
});
