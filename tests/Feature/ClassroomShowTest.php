<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderDraft;
use App\Models\Payment;
use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

beforeEach(function () {
    actingAsRole();
});

it('interleaves orders and drafts sorted by photo number', function () {
    $classroom = Classroom::factory()->create();

    $second = Order::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 2]);
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 1]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page
            ->component('classrooms/show')
            ->has('students.data', 2)
            ->where('students.data.0.id', $draft->id)
            ->where('students.data.0.kind', 'draft')
            ->where('students.data.1.id', $second->id)
            ->where('students.data.1.kind', 'order'),
    );
});

it('matches a draft by child name and still matches orders', function () {
    $classroom = Classroom::factory()->create();

    $order = Order::factory()->create(['classroom_id' => $classroom->id, 'child_name' => 'Joaquín Pérez']);
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'child_name' => 'Mateo Díaz']);
    OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'child_name' => 'Otro Nombre']);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id, 'search' => 'Joaquín']));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    expect(array_map(fn (array $row) => (int) $row['id'], $students))->toBe([$order->id]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id, 'search' => 'Mateo']));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    expect(array_map(fn (array $row) => (int) $row['id'], $students))->toBe([$draft->id]);
});

it('matches a draft by phone digits', function () {
    $classroom = Classroom::factory()->create();

    $client = Client::factory()->create(['phone' => '3804000003']);
    Order::factory()->create(['classroom_id' => $classroom->id, 'client_id' => $client->id]);
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'client_phone' => '380 400-0099']);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id, 'search' => '3804000099']));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];

    expect(array_map(fn (array $row) => (int) $row['id'], $students))->toBe([$draft->id]);
});

it('matches a draft by a leading-zero phone fragment', function () {
    $classroom = Classroom::factory()->create();

    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'client_phone' => '3804000001']);
    OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'client_phone' => '3804999999']);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id, 'search' => '001']));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];

    expect(array_map(fn (array $row) => (int) $row['id'], $students))->toBe([$draft->id]);
});

it('counts both orders and drafts in the pagination total', function () {
    $classroom = Classroom::factory()->create();

    Order::factory()->count(2)->create(['classroom_id' => $classroom->id]);
    OrderDraft::factory()->count(3)->create(['classroom_id' => $classroom->id]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page->where('students.meta.total', 5),
    );
});

it('reports no assignable details when the classroom has none in scope', function () {
    $classroom = Classroom::factory()->create();

    $product = Product::factory()->create(['has_photo' => false]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page->where('hasAssignableDetails', false),
    );
});

it('reports assignable details when the classroom has at least one in scope', function () {
    $classroom = Classroom::factory()->create();

    $product = Product::factory()->create(['has_photo' => true]);
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
    ]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page->where('hasAssignableDetails', true),
    );
});

it('reports zero paid installments for an order with no payments', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(0);
});

it('reports one paid installment for an order with a single installment payment', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 16000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(1);
});

it('reports all installments paid for a fully paid order', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 64000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(4);
});

it('caps paid installments at the payment plan when overpaid', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 80000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(4);
});

it('reports zero paid installments for a partial payment below one installment', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 8000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(0);
});

it('reports zero paid installments for a draft', function () {
    $classroom = Classroom::factory()->create();
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $draft->id);

    expect($row['paid_installments'])->toBe(0);
});

it('reports a zero current installment fraction for an order with no payments', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['current_installment_fraction'])->toEqual(0.0);
});

it('reports a half current installment fraction for a partial payment below one installment', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 8000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(0)
        ->and($row['current_installment_fraction'])->toBe(0.5);
});

it('reports the fraction of the second installment after paying one full plus a remainder', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 24000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['paid_installments'])->toBe(1)
        ->and($row['current_installment_fraction'])->toBe(0.5);
});

it('reports a zero current installment fraction for a fully paid order', function () {
    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 64000]);

    $response = get(route('classrooms.show', ['classroom' => $classroom->id]));
    $response->assertOk();
    /** @var array<int, array<string, mixed>> $students */
    $students = $response->viewData('page')['props']['students']['data'];
    $row = collect($students)->firstOrFail(fn (array $row) => (int) $row['id'] === $order->id);

    expect($row['current_installment_fraction'])->toEqual(0.0);
});
