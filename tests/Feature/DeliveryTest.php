<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\OrderDetail;

use function Pest\Laravel\put;

it('marks only the selected details as delivered', function () {
    actingAsRole();

    $order = Order::factory()->create();
    [$first, $second] = OrderDetail::factory()->count(2)->create(['order_id' => $order->id]);

    put(route('orders.delivery', $order), [
        'detail_ids' => [$first->id],
        'action' => 'deliver',
    ])->assertSessionHasNoErrors();

    expect($first->refresh()->delivered_at)->not->toBeNull()
        ->and($second->refresh()->delivered_at)->toBeNull();
});

it('can undo a delivery', function () {
    actingAsRole();

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->delivered()->create(['order_id' => $order->id]);

    put(route('orders.delivery', $order), [
        'detail_ids' => [$detail->id],
        'action' => 'undeliver',
    ]);

    expect($detail->refresh()->delivered_at)->toBeNull();
});

it('rejects deliveries on a cancelled order', function () {
    actingAsRole();

    $order = Order::factory()->cancelled()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.delivery', $order), [
        'detail_ids' => [$detail->id],
        'action' => 'deliver',
    ])->assertSessionHasErrors('order');

    expect($detail->refresh()->delivered_at)->toBeNull();
});

it('ignores recycled details', function () {
    actingAsRole();

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->recycled()->create(['order_id' => $order->id]);

    put(route('orders.delivery', $order), [
        'detail_ids' => [$detail->id],
        'action' => 'deliver',
    ])->assertSessionHasErrors('detail_ids');

    expect($detail->refresh()->delivered_at)->toBeNull();
});
