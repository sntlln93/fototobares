<?php

declare(strict_types=1);

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;

use function Pest\Laravel\get;

/**
 * @param  array<string, mixed>  $attributes
 */
function orderFor(string $clientName, string $phone, array $attributes = []): Order
{
    $client = Client::factory()->create(['name' => $clientName, 'phone' => $phone]);

    return Order::factory()->create([...$attributes, 'client_id' => $client->id]);
}

/**
 * @return array<int, int>
 */
function searchedOrderIds(string $term, ?Classroom $classroom = null): array
{
    $route = $classroom === null
        ? route('orders.index', ['search' => $term])
        : route('classrooms.show', ['classroom' => $classroom->id, 'search' => $term]);

    $response = get($route);
    $response->assertOk();

    $prop = $classroom === null ? 'orders' : 'students';

    /** @var array<int, array<string, mixed>> $rows */
    $rows = $response->viewData('page')['props'][$prop]['data'];

    return array_map(fn (array $row) => (int) $row['id'], $rows);
}

beforeEach(function () {
    actingAsRole();
});

it('finds an order by the client phone', function () {
    $order = orderFor('Carla López', '3804000003');
    orderFor('Otro Cliente', '3804999999');

    expect(searchedOrderIds('3804000003'))->toBe([$order->id]);
});

it('finds an order by a phone typed as it arrives from whatsapp', function (string $term) {
    $order = orderFor('Carla López', '3804000003');
    orderFor('Otro Cliente', '3804999999');

    expect(searchedOrderIds($term))->toBe([$order->id]);
})->with([
    'international' => '+54 9 380 400-0003',
    'country code' => '543804000003',
    'trunk zero' => '03804000003',
    'last digits' => '000003',
]);

it('finds an order whose phone is stored with separators', function () {
    $order = orderFor('Carla López', '380 400-0003');

    expect(searchedOrderIds('3804000003'))->toBe([$order->id]);
});

it('finds an order by the client name, case and accent insensitive', function (string $term) {
    $order = orderFor('Carla López', '3804000003');
    orderFor('Otro Cliente', '3804999999');

    expect(searchedOrderIds($term))->toBe([$order->id]);
})->with([
    'lowercase' => 'carla',
    'without accent' => 'lopez',
]);

it('finds an order by the child name', function () {
    $order = orderFor('Carla López', '3804000003', ['child_name' => 'Joaquín Pérez']);
    orderFor('Otro Cliente', '3804999999', ['child_name' => 'Mateo Díaz']);

    expect(searchedOrderIds('Joaquín'))->toBe([$order->id]);
});

it('finds an order by the child order number in its classroom', function () {
    $order = orderFor('Carla López', '3804000003', ['photo_number' => 12]);
    orderFor('Otro Cliente', '3804999999', ['photo_number' => 34]);

    expect(searchedOrderIds('12'))->toBe([$order->id]);
});

it('still finds an order by its number', function () {
    $order = orderFor('Carla López', '3804000003');

    expect(searchedOrderIds((string) $order->id))->toContain($order->id);
});

it('matches phones on a 3-digit numeric fragment', function () {
    $order = orderFor('Carla López', '3804380999');

    expect(searchedOrderIds('380'))->toBe([$order->id]);
});

it('matches an order by a leading-zero phone fragment', function () {
    $order = orderFor('Carla López', '3804000001');
    orderFor('Otro Cliente', '3804999999');

    expect(searchedOrderIds('001'))->toBe([$order->id]);
});

it('does not match phones on a 2-digit numeric term, below the minimum', function () {
    orderFor('Carla López', '3804380999');

    expect(searchedOrderIds('38'))->toBe([]);
});

it('returns nothing when no order matches', function () {
    orderFor('Carla López', '3804000003');

    expect(searchedOrderIds('3804111111'))->toBe([]);
});

it('keeps the classroom search scoped to its classroom', function () {
    $classroom = Classroom::factory()->create();
    $other = Classroom::factory()->create();

    $order = orderFor('Carla López', '3804000003', ['classroom_id' => $classroom->id]);
    orderFor('Carla López', '3804000003', ['classroom_id' => $other->id]);

    expect(searchedOrderIds('3804000003', $classroom))->toBe([$order->id]);
});

it('echoes the search term back to the page', function () {
    orderFor('Carla López', '3804000003');

    get(route('orders.index', ['search' => '3804000003']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('filters.search', '3804000003'));
});
