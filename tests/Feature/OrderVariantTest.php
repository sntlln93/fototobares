<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Order;
use App\Models\Product;

use function Pest\Laravel\post;

/**
 * @return array<string, mixed>
 */
function baseOrderPayload(Classroom $classroom): array
{
    return [
        'name' => 'Cliente Test',
        'phone' => '3804123456',
        'classroom_id' => $classroom->id,
        'total_price' => 48000,
        'payment_plan' => 1,
        'due_date' => now()->addMonth()->format('Y-m-d'),
        'child_name' => 'Niño Test',
        'attended_photo_session' => true,
    ];
}

it('rejects an order detail missing a required variant selection', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->mural()->create();

    post(route('orders.store'), [
        ...baseOrderPayload($classroom),
        'order_details' => [
            ['product_id' => $product->id, 'note' => 'sin nota', 'variant' => [
                'Tipo de foto' => 'Grupo',
                'Orientación' => 'Vertical',
                'Fondo' => 'Celeste',
                // Color omitted, but it is not nullable for this product
            ]],
        ],
    ])->assertSessionHasErrors('order_details.0.variant');
});

it('rejects an order detail with a variant value outside the product options', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->mural()->create();

    post(route('orders.store'), [
        ...baseOrderPayload($classroom),
        'order_details' => [
            ['product_id' => $product->id, 'note' => 'sin nota', 'variant' => [
                'Tipo de foto' => 'Grupo',
                'Orientación' => 'Vertical',
                'Fondo' => 'Celeste',
                'Color' => 'Dorado',
            ]],
        ],
    ])->assertSessionHasErrors('order_details.0.variant');
});

it('allows omitting a nullable variant and snapshots it as pending', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->banda()->create();

    post(route('orders.store'), [
        ...baseOrderPayload($classroom),
        'total_price' => 9000,
        'order_details' => [
            ['product_id' => $product->id, 'note' => 'sin nota'],
        ],
    ])->assertSessionHasNoErrors();

    $order = Order::latest('id')->firstOrFail();
    $variant = $order->details()->firstOrFail()->variant;

    expect($variant)->toHaveCount(1)
        ->and($variant[0]['label'])->toBe('Talle')
        ->and($variant[0]['value'])->toBeNull();
});

it('builds the variant snapshot from the product definition, not from client input', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->mural()->create();

    post(route('orders.store'), [
        ...baseOrderPayload($classroom),
        'order_details' => [
            ['product_id' => $product->id, 'note' => 'sin nota', 'variant' => [
                'Tipo de foto' => 'Grupo',
                'Orientación' => 'Vertical',
                'Fondo' => 'Celeste',
                'Color' => 'Negro',
            ]],
        ],
    ])->assertSessionHasNoErrors();

    $order = Order::latest('id')->firstOrFail();
    $colorEntry = collect($order->details()->firstOrFail()->variant)->firstWhere('label', 'Color');

    expect($colorEntry['value']['label'])->toBe('Negro')
        ->and($colorEntry['value']['color'])->toBe('#1c1917');
});
