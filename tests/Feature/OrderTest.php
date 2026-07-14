<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDraft;
use App\Models\Payment;
use App\Models\Product;

use function Pest\Laravel\assertSoftDeleted;
use function Pest\Laravel\delete;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

/**
 * @return array<string, mixed>
 */
function validOrderPayload(Classroom $classroom, Product $product): array
{
    return [
        'name' => 'Cliente Test',
        'phone' => '3804123456',
        'classroom_id' => $classroom->id,
        'total_price' => 12000,
        'payment_plan' => 1,
        'due_date' => now()->addMonth()->format('Y-m-d'),
        'child_name' => 'Niño Test',
        'attended_photo_session' => true,
        'order_details' => [
            ['product_id' => $product->id, 'note' => 'sin nota'],
        ],
    ];
}

it('assigns the next photo number within the classroom', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    Order::factory()->create([
        'classroom_id' => $classroom->id,
        'photo_number' => 5,
    ]);

    post(route('orders.store'), validOrderPayload($classroom, $product))
        ->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBe(6);
});

it('does not assign a photo number when the child did not attend the session', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    post(route('orders.store'), [
        ...validOrderPayload($classroom, $product),
        'attended_photo_session' => false,
    ])->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBeNull();
});

it('consumes the draft when an order is created from it', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id]);

    post(route('orders.store'), [
        ...validOrderPayload($classroom, $product),
        'draft_id' => $draft->id,
    ])->assertSessionHasNoErrors();

    expect(OrderDraft::find($draft->id))->toBeNull();
});

it('blocks edition once the first installment is fully paid', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->create([
        'classroom_id' => $classroom->id,
        'total_price' => 64000,
        'payment_plan' => 4,
    ]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 16000]);

    put(route('orders.update', $order), validOrderPayload($classroom, $product))
        ->assertSessionHasErrors('order');
});

it('allows edition while the first installment is not fully paid', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->create([
        'classroom_id' => $classroom->id,
        'total_price' => 64000,
        'payment_plan' => 4,
    ]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 15000]);

    put(route('orders.update', $order), validOrderPayload($classroom, $product))
        ->assertSessionHasNoErrors();

    expect($order->refresh()->child_name)->toBe('Niño Test');
});

it('cannot delete an order with payments', function () {
    actingAsRole();

    $order = Order::factory()->create();
    Payment::factory()->create(['order_id' => $order->id]);

    delete(route('orders.destroy', $order))->assertSessionHasErrors('order');

    expect(Order::find($order->id))->not->toBeNull();
});

it('soft deletes an order without payments', function () {
    actingAsRole();

    $order = Order::factory()->create();

    delete(route('orders.destroy', $order))->assertSessionHasNoErrors();

    assertSoftDeleted('orders', ['id' => $order->id]);
});

it('keeps each detail of a repeated product apart when the order is edited', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->create([
        'classroom_id' => $classroom->id,
        'total_price' => 24000,
        'payment_plan' => 2,
    ]);

    // The same product twice: two mugs with a different name printed on each
    $order->products()->attach($product->id, ['note' => 'Taza de Luca', 'variant' => []]);
    $order->products()->attach($product->id, ['note' => 'Taza de Emma', 'variant' => []]);

    $details = $order->details()->orderBy('id')->get();

    // Regression: syncing by product_id collapsed both rows into one, so
    // editing the price alone overwrote the first note with the second
    put(route('orders.update', $order), [
        ...validOrderPayload($classroom, $product),
        'total_price' => 30000,
        'order_details' => $details->map(fn ($detail) => [
            'id' => $detail->id,
            'product_id' => $detail->product_id,
            'note' => $detail->note,
        ])->all(),
    ])->assertSessionHasNoErrors();

    expect($order->refresh()->total_price)->toBe(30000)
        ->and($order->details()->orderBy('id')->pluck('note')->all())
        ->toBe(['Taza de Luca', 'Taza de Emma']);
});

it('updates the note of a single detail without touching its twin', function () {
    actingAsRole();

    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->create(['classroom_id' => $classroom->id]);

    $order->products()->attach($product->id, ['note' => 'Taza de Luca', 'variant' => []]);
    $order->products()->attach($product->id, ['note' => 'Taza de Emma', 'variant' => []]);

    $details = $order->details()->orderBy('id')->get();

    put(route('orders.update', $order), [
        ...validOrderPayload($classroom, $product),
        'order_details' => [
            ['id' => $details[0]->id, 'product_id' => $product->id, 'note' => 'Taza de Lucas'],
            ['id' => $details[1]->id, 'product_id' => $product->id, 'note' => 'Taza de Emma'],
        ],
    ])->assertSessionHasNoErrors();

    expect($order->details()->orderBy('id')->pluck('note')->all())
        ->toBe(['Taza de Lucas', 'Taza de Emma']);
});
