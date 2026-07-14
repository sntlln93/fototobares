<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

beforeEach(function () {
    actingAsRole();
});

it('interleaves orders and drafts sorted by photo number, nulls last', function () {
    $classroom = Classroom::factory()->create();

    $second = Order::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 2]);
    $unnumbered = Order::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => null]);
    $draft = OrderDraft::factory()->create(['classroom_id' => $classroom->id, 'photo_number' => 1]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page
            ->component('classrooms/show')
            ->has('students.data', 3)
            ->where('students.data.0.id', $draft->id)
            ->where('students.data.0.kind', 'draft')
            ->where('students.data.1.id', $second->id)
            ->where('students.data.1.kind', 'order')
            ->where('students.data.2.id', $unnumbered->id),
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

it('counts both orders and drafts in the pagination total', function () {
    $classroom = Classroom::factory()->create();

    Order::factory()->count(2)->create(['classroom_id' => $classroom->id]);
    OrderDraft::factory()->count(3)->create(['classroom_id' => $classroom->id]);

    get(route('classrooms.show', ['classroom' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page->where('students.meta.total', 5),
    );
});
