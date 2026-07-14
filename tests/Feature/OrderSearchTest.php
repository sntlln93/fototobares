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

    /** @var array<int, array<string, mixed>> $orders */
    $orders = $response->viewData('page')['props']['orders']['data'];

    return array_map(fn (array $order) => (int) $order['id'], $orders);
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

it('still finds an order by its number', function () {
    $order = orderFor('Carla López', '3804000003');

    expect(searchedOrderIds((string) $order->id))->toContain($order->id);
});

it('does not match phones on a short numeric term, which is an order number', function () {
    orderFor('Carla López', '3804380999');

    expect(searchedOrderIds('380'))->toBe([]);
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
