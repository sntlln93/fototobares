<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;
use App\Models\School;

use function Pest\Laravel\get;

/**
 * @param  array<string, int|string>  $query
 * @return array<int, int>
 */
function filteredOrderIds(array $query): array
{
    $response = get(route('orders.index', $query));
    $response->assertOk();

    /** @var array<int, array<string, mixed>> $orders */
    $orders = $response->viewData('page')['props']['orders']['data'];

    return array_map(fn (array $order) => (int) $order['id'], $orders);
}

beforeEach(function () {
    actingAsRole();
});

it('filters orders by school', function () {
    $classroom = Classroom::factory()->create();
    $other = Classroom::factory()->create();

    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Order::factory()->create(['classroom_id' => $other->id]);

    expect(filteredOrderIds(['school_id' => $classroom->school_id]))->toBe([$order->id]);
});

it('filters orders by classroom, narrower than its school', function () {
    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    $sibling = Classroom::factory()->create(['school_id' => $school->id]);

    $order = Order::factory()->create(['classroom_id' => $classroom->id]);
    Order::factory()->create(['classroom_id' => $sibling->id]);

    expect(filteredOrderIds(['classroom_id' => $classroom->id]))->toBe([$order->id])
        ->and(filteredOrderIds(['school_id' => $school->id]))->toHaveCount(2);
});

it('combines the classroom filter with the search term', function () {
    $classroom = Classroom::factory()->create();
    $other = Classroom::factory()->create();

    $client = Client::factory()->create(['name' => 'Carla López']);
    $order = Order::factory()->create([
        'classroom_id' => $classroom->id,
        'client_id' => $client->id,
    ]);

    // Same client name in another classroom: search alone would match it
    $twin = Client::factory()->create(['name' => 'Carla López']);
    Order::factory()->create([
        'classroom_id' => $other->id,
        'client_id' => $twin->id,
    ]);

    expect(filteredOrderIds(['classroom_id' => $classroom->id, 'search' => 'Carla']))
        ->toBe([$order->id]);
});

it('returns nothing when no order belongs to the filtered classroom', function () {
    Order::factory()->create();
    $empty = Classroom::factory()->create();

    expect(filteredOrderIds(['classroom_id' => $empty->id]))->toBe([]);
});

it('echoes the applied filters back to the page', function () {
    $classroom = Classroom::factory()->create();
    Order::factory()->create(['classroom_id' => $classroom->id]);

    get(route('orders.index', [
        'school_id' => $classroom->school_id,
        'classroom_id' => $classroom->id,
        'search' => 'carla',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.school_id', $classroom->school_id)
            ->where('filters.classroom_id', $classroom->id)
            ->where('filters.search', 'carla'));
});

it('echoes null filters when nothing is applied', function () {
    Order::factory()->create();

    get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.school_id', null)
            ->where('filters.classroom_id', null)
            ->where('filters.search', null));
});
