<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\Payment;

use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('registers a cash payment without a transaction number', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'efectivo',
    ])->assertSessionHasNoErrors();

    $payment = $order->payments()->first();

    expect($payment?->amount)->toBe(5000)
        ->and($payment?->transaction_number)->toBeNull();
});

it('registers a transfer payment with its transaction number', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ])->assertSessionHasNoErrors();

    expect($order->payments()->first()?->transaction_number)->toBe('MP12345678');
});

it('requires the transaction number on transfer payments', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
    ])->assertSessionHasErrors([
        'transaction_number' => 'El número de transacción es obligatorio para pagos por transferencia.',
    ]);

    expect($order->payments()->count())->toBe(0);
});

it('rejects a non-alphanumeric transaction number', function (string $invalid) {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'transaction_number' => $invalid,
    ])->assertSessionHasErrors([
        'transaction_number' => 'El número de transacción sólo puede contener letras y números.',
    ]);
})->with(['MP-1234', 'MP 1234', '1234!', 'ñ1234']);

it('rejects a duplicate transaction number pointing to the order that has it', function () {
    actingAsRole();

    $existing = Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ]);

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ])->assertSessionHasErrors([
        'transaction_number' => "El número de transacción ya está registrado en el pedido #{$existing->order_id}.",
    ]);

    expect($order->payments()->count())->toBe(0);
});

it('detects duplicate transaction numbers regardless of case', function () {
    actingAsRole();

    Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ]);

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'transaction_number' => 'mp12345678',
    ])->assertSessionHasErrors('transaction_number');
});

it('ignores the transaction number sent with a cash payment', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'efectivo',
        'transaction_number' => 'MP12345678',
    ])->assertSessionHasNoErrors();

    expect($order->payments()->first()?->transaction_number)->toBeNull();
});

it('lets a payment keep its own transaction number on update', function () {
    actingAsRole();

    $payment = Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ]);

    put(route('payments.update', $payment), [
        'order_id' => $payment->order_id,
        'amount' => 7000,
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ])->assertSessionHasNoErrors();

    $payment->refresh();

    expect($payment->amount)->toBe(7000)
        ->and($payment->transaction_number)->toBe('MP12345678');
});

it('rejects reusing another payment transaction number on update', function () {
    actingAsRole();

    $existing = Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ]);

    $payment = Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP87654321',
    ]);

    put(route('payments.update', $payment), [
        'order_id' => $payment->order_id,
        'amount' => $payment->amount,
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ])->assertSessionHasErrors([
        'transaction_number' => "El número de transacción ya está registrado en el pedido #{$existing->order_id}.",
    ]);

    expect($payment->refresh()->transaction_number)->toBe('MP87654321');
});

it('clears the transaction number when a transfer becomes a cash payment', function () {
    actingAsRole();

    $payment = Payment::factory()->create([
        'type' => 'transferencia',
        'transaction_number' => 'MP12345678',
    ]);

    put(route('payments.update', $payment), [
        'order_id' => $payment->order_id,
        'amount' => $payment->amount,
        'type' => 'efectivo',
    ])->assertSessionHasNoErrors();

    expect($payment->refresh()->transaction_number)->toBeNull();
});
