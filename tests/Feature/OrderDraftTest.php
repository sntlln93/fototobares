<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDraft;
use App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

/**
 * @return array<string, mixed>
 */
function validDraftPayload(Classroom $classroom, array $overrides = []): array
{
    return [
        'classroom_id' => $classroom->id,
        'child_name' => 'Niño Test',
        'client_name' => 'Cliente Test',
        'client_phone' => '3804123456',
        'attended_photo_session' => true,
        'total_price' => 12000,
        'payment_plan' => 1,
        'due_date' => now()->addMonth()->format('Y-m-d'),
        ...$overrides,
    ];
}

/**
 * @return array<string, mixed>
 */
function validOrderPayloadFor(Classroom $classroom, Product $product, array $overrides = []): array
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
        ...$overrides,
    ];
}

beforeEach(function () {
    actingAsRole();
});

it('allocates the next number shared with orders', function () {
    $classroom = Classroom::factory()->create();

    Order::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 1]);

    post(route('drafts.store'), validDraftPayload($classroom))
        ->assertSessionHasNoErrors();

    expect(OrderDraft::latest('id')->first()?->photo_number)->toBe(2);
});

it('does not assign a photo number when the child did not attend the session', function () {
    $classroom = Classroom::factory()->create();

    post(route('drafts.store'), validDraftPayload($classroom, ['attended_photo_session' => false]))
        ->assertSessionHasNoErrors();

    expect(OrderDraft::latest('id')->first()?->photo_number)->toBeNull();
});

it('interleaves orders and drafts within a classroom, following creation order', function () {
    $sextoA = Classroom::factory()->create();
    $sextoB = Classroom::factory()->create();
    $product = Product::factory()->create();

    // 6to A: Carla(1), Juan(2), Felipe(draft, 3), Matías(4)
    post(route('orders.store'), validOrderPayloadFor($sextoA, $product, ['child_name' => 'Carla']));
    post(route('orders.store'), validOrderPayloadFor($sextoA, $product, ['child_name' => 'Juan']));
    post(route('drafts.store'), validDraftPayload($sextoA, ['child_name' => 'Felipe']));
    post(route('orders.store'), validOrderPayloadFor($sextoA, $product, ['child_name' => 'Matías']));

    // 6to B: Pedro(draft, 1), Carlos(2)
    post(route('drafts.store'), validDraftPayload($sextoB, ['child_name' => 'Pedro']));
    post(route('orders.store'), validOrderPayloadFor($sextoB, $product, ['child_name' => 'Carlos']));

    expect(Order::where('classroom_id', $sextoA->id)->where('child_name', 'Carla')->first()?->photo_number)->toBe(1)
        ->and(Order::where('classroom_id', $sextoA->id)->where('child_name', 'Juan')->first()?->photo_number)->toBe(2)
        ->and(OrderDraft::where('classroom_id', $sextoA->id)->where('child_name', 'Felipe')->first()?->photo_number)->toBe(3)
        ->and(Order::where('classroom_id', $sextoA->id)->where('child_name', 'Matías')->first()?->photo_number)->toBe(4)
        ->and(OrderDraft::where('classroom_id', $sextoB->id)->where('child_name', 'Pedro')->first()?->photo_number)->toBe(1)
        ->and(Order::where('classroom_id', $sextoB->id)->where('child_name', 'Carlos')->first()?->photo_number)->toBe(2);
});

it('skips the number already taken by a draft when a plain order is created', function () {
    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 1]);

    post(route('orders.store'), validOrderPayloadFor($classroom, $product))
        ->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBe(2);
});

it('reuses the draft photo number when completing it in its own classroom', function () {
    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 7]);

    post(route('orders.store'), [
        ...validOrderPayloadFor($classroom, $product),
        'draft_id' => $draft->id,
    ])->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBe(7)
        ->and(OrderDraft::find($draft->id))->toBeNull();
});

it('allocates a fresh number when completing a draft into a different classroom', function () {
    $originalClassroom = Classroom::factory()->create();
    $targetClassroom = Classroom::factory()->create();
    $product = Product::factory()->create();

    Order::factory()->create(['classroom_id' => $targetClassroom->id, 'photo_number' => 1]);
    $draft = OrderDraft::factory()->create(['classroom_id' => $originalClassroom->id, 'photo_number' => 7]);

    post(route('orders.store'), [
        ...validOrderPayloadFor($targetClassroom, $product),
        'draft_id' => $draft->id,
    ])->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBe(2);
});

it('does not assign a photo number when completing a draft with attended_photo_session false', function () {
    $classroom = Classroom::factory()->create();
    $product = Product::factory()->create();
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 7]);

    post(route('orders.store'), [
        ...validOrderPayloadFor($classroom, $product, ['attended_photo_session' => false]),
        'draft_id' => $draft->id,
    ])->assertSessionHasNoErrors();

    expect(Order::latest('id')->first()?->photo_number)->toBeNull();
});

it('exposes the photo number on the drafts index', function () {
    $classroom = Classroom::factory()->create();

    OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 3]);

    $response = get(route('drafts.index'));
    $response->assertOk();

    /** @var array<int, array<string, mixed>> $drafts */
    $drafts = $response->viewData('page')['props']['drafts']['data'];

    expect($drafts[0]['photo_number'])->toBe(3);
});
