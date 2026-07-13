<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderDetail;

use function Pest\Laravel\put;

it('flags a detail as priority and unflags it', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => true,
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->priority)->toBeTrue();

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => false,
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->priority)->toBeFalse();
});

it('rejects a detail that belongs to another order', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->create();

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => true,
    ])->assertSessionHasErrors('detail_id');

    expect($detail->refresh()->priority)->toBeFalse();
});

it('rejects a delivered detail', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->delivered()->create(['order_id' => $order->id]);

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => true,
    ])->assertSessionHasErrors('detail_id');

    expect($detail->refresh()->priority)->toBeFalse();
});

it('rejects a cancelled order', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->cancelled()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => true,
    ])->assertSessionHasErrors('order');

    expect($detail->refresh()->priority)->toBeFalse();
});

it('denies the workshop role, which only reads the priority in tracking', function () {
    actingAsRole(UserRole::Worker);

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.priority', $order), [
        'detail_id' => $detail->id,
        'priority' => true,
    ])->assertForbidden();

    expect($detail->refresh()->priority)->toBeFalse();
});
