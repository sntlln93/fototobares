<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Stockable;

use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('cancels the order and stores each product destination', function () {
    actingAsRole();

    $order = Order::factory()->create();
    [$toStock, $toRecycling] = OrderDetail::factory()->count(2)->create(['order_id' => $order->id]);

    post(route('orders.cancel', $order), [
        'destinations' => [
            ['detail_id' => $toStock->id, 'destination' => 'stock'],
            ['detail_id' => $toRecycling->id, 'destination' => 'reciclaje'],
        ],
    ])->assertSessionHasNoErrors();

    expect($order->refresh()->cancelled_at)->not->toBeNull()
        ->and($toStock->refresh()->recycled_to)->toBe('stock')
        ->and($toRecycling->refresh()->recycled_to)->toBe('reciclaje');
});

it('returns supplies to stock only if they had been deducted', function () {
    actingAsRole();

    $product = Product::factory()->mural()->create();
    $stockable = Stockable::factory()->create(['quantity' => 9]);
    $product->stockables()->attach($stockable->id);

    $order = Order::factory()->create();
    $deducted = OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'stock_deducted_at' => now(),
    ]);
    $notDeducted = OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    post(route('orders.cancel', $order), [
        'destinations' => [
            ['detail_id' => $deducted->id, 'destination' => 'stock'],
            ['detail_id' => $notDeducted->id, 'destination' => 'stock'],
        ],
    ]);

    // Only one unit returned: the detail that never started production has nothing to return
    expect($stockable->refresh()->quantity)->toBe(10)
        ->and($stockable->movements()->where('reason', 'devolución por cancelación')->count())->toBe(1);
});

it('rejects details that belong to another order', function () {
    actingAsRole();

    $order = Order::factory()->create();
    $foreign = OrderDetail::factory()->create();

    post(route('orders.cancel', $order), [
        'destinations' => [
            ['detail_id' => $foreign->id, 'destination' => 'reciclaje'],
        ],
    ])->assertSessionHasErrors('destinations');

    expect($order->refresh()->cancelled_at)->toBeNull();
});

it('blocks payments, edition and delivery on a cancelled order', function () {
    actingAsRole();

    $order = Order::factory()->cancelled()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 1000,
        'type' => 'efectivo',
    ])->assertSessionHasErrors('order_id');

    put(route('orders.delivery', $order), [
        'detail_ids' => [$detail->id],
        'action' => 'deliver',
    ])->assertSessionHasErrors('order');

    post(route('orders.cancel', $order), [
        'destinations' => [
            ['detail_id' => $detail->id, 'destination' => 'stock'],
        ],
    ])->assertSessionHasErrors('order');
});
