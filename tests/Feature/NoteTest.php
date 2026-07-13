<?php

declare(strict_types=1);

use App\Models\Note;
use App\Models\Order;

use function Pest\Laravel\delete;
use function Pest\Laravel\post;

it('adds a note to an order', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('notes.store'), [
        'order_id' => $order->id,
        'body' => 'Llamar al cliente antes de entregar.',
    ])->assertSessionHasNoErrors();

    expect($order->notes()->first()?->body)->toBe('Llamar al cliente antes de entregar.');
});

it('requires a body to add a note', function () {
    actingAsRole();

    $order = Order::factory()->create();

    post(route('notes.store'), [
        'order_id' => $order->id,
        'body' => '',
    ])->assertSessionHasErrors('body');

    expect($order->notes()->count())->toBe(0);
});

it('deletes a note', function () {
    actingAsRole();

    $note = Note::factory()->create();

    delete(route('notes.destroy', $note))->assertSessionHasNoErrors();

    expect(Note::find($note->id))->toBeNull();
});
