<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;

use function Pest\Laravel\put;

/**
 * @return array<int, array{label: string, type: string, nullable: bool, options: array<int, array{label: string}>}>
 */
function bandaVariants(): array
{
    return [
        ['label' => 'Talle', 'type' => 'text', 'nullable' => true, 'options' => [
            ['label' => 'Único'],
            ['label' => 'S'],
            ['label' => 'M'],
        ]],
    ];
}

/**
 * @return array<int, array{label: string, type: string, nullable: bool, options: array<int, array{label: string, color?: string}>}>
 */
function muralVariants(): array
{
    return [
        ['label' => 'Color', 'type' => 'color', 'nullable' => false, 'options' => [
            ['label' => 'Negro', 'color' => '#1c1917'],
            ['label' => 'Rosa', 'color' => '#f9a8d4'],
        ]],
    ];
}

it('sets a pending nullable variant', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create();
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => 'M'],
    ])->assertSessionHasNoErrors();

    $variant = $detail->refresh()->variant;

    expect($variant[0]['value']['label'])->toBe('M')
        ->and($variant[0]['value']['color'])->toBeNull();
});

it('clears a nullable variant back to pending', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create();
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => ['label' => 'M']],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => null],
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->variant[0]['value'])->toBeNull();
});

it('rejects nulling a non-nullable variant', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => muralVariants()]);
    $order = Order::factory()->create();
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Color', 'type' => 'color', 'value' => ['label' => 'Negro', 'color' => '#1c1917']],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Color' => null],
    ])->assertSessionHasErrors('variant');

    $value = $detail->refresh()->variant[0]['value'];

    expect($value['label'])->toBe('Negro')
        ->and($value['color'])->toBe('#1c1917');
});

it('rejects a value outside the product options', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create();
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => 'XL'],
    ])->assertSessionHasErrors('variant');
});

it('blocks updates for a cancelled order', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create(['cancelled_at' => now()]);
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => 'M'],
    ])->assertSessionHasErrors('order');

    expect($detail->refresh()->variant[0]['value'])->toBeNull();
});

it('rejects a detail that belongs to another order', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create();
    $otherOrder = Order::factory()->create();
    $otherOrder->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $foreignDetail = $otherOrder->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $foreignDetail->id,
        'variant' => ['Talle' => 'M'],
    ])->assertSessionHasErrors('detail_id');

    expect($foreignDetail->refresh()->variant[0]['value'])->toBeNull();
});

it('is forbidden for the workshop role', function () {
    actingAsRole(UserRole::Worker);

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create();
    $order->products()->attach($product->id, ['note' => 'Nota', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => 'M'],
    ])->assertForbidden();
});

it('does not touch the note, price or production status', function () {
    actingAsRole();

    $product = Product::factory()->create(['variants' => bandaVariants()]);
    $order = Order::factory()->create(['total_price' => 9000, 'payment_plan' => 1]);
    $order->products()->attach($product->id, ['note' => 'Nota original', 'variant' => [
        ['label' => 'Talle', 'type' => 'text', 'value' => null],
    ]]);
    $detail = $order->details()->firstOrFail();

    put(route('orders.variant', $order), [
        'detail_id' => $detail->id,
        'variant' => ['Talle' => 'M'],
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->note)->toBe('Nota original')
        ->and($order->refresh()->total_price)->toBe(9000)
        ->and($order->refresh()->payment_plan)->toBe(1);
});
