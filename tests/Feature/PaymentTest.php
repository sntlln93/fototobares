<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\post;
use function Pest\Laravel\put;

it('registers a payment without a proof of payment', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'efectivo',
    ])->assertSessionHasNoErrors();

    $payment = $order->payments()->first();

    expect($payment?->amount)->toBe(5000)
        ->and($payment?->proof_of_payment)->toBeNull();
});

it('stores the attached proof of payment', function () {
    Storage::fake('public');
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'proof_of_payment' => UploadedFile::fake()->image('comprobante.jpg'),
    ])->assertSessionHasNoErrors();

    $payment = $order->payments()->first();

    expect($payment?->proof_of_payment)->not->toBeNull();
    Storage::disk('public')->assertExists($payment->proof_of_payment);
});

it('replaces the previous proof when a new one is uploaded', function () {
    Storage::fake('public');
    actingAsRole();

    $oldPath = UploadedFile::fake()->image('viejo.jpg')->store('proofs', 'public');
    $payment = Payment::factory()->create(['proof_of_payment' => $oldPath]);

    put(route('payments.update', $payment), [
        'order_id' => $payment->order_id,
        'amount' => 7000,
        'type' => 'transferencia',
        'proof_of_payment' => UploadedFile::fake()->image('nuevo.jpg'),
    ])->assertSessionHasNoErrors();

    $payment->refresh();

    expect($payment->proof_of_payment)->not->toBe($oldPath)
        ->and($payment->amount)->toBe(7000);

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($payment->proof_of_payment);
});

it('rejects an invalid proof file', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('payments.store'), [
        'order_id' => $order->id,
        'amount' => 5000,
        'type' => 'transferencia',
        'proof_of_payment' => UploadedFile::fake()->create('malicioso.exe', 100),
    ])->assertSessionHasErrors('proof_of_payment');
});
