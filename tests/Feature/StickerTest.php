<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderDetail;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

beforeEach(function () {
    actingAsRole(UserRole::Office);

    // `Order::isFinished()` memoizes the per-product last stage position in
    // a private static, valid for the lifetime of a single PHP process. In
    // production that's one HTTP request; across Pest tests in the same
    // process it leaks stale data for products created in earlier tests, so
    // reset it here to keep each test isolated.
    $cache = new ReflectionProperty(Order::class, 'lastPositions');
    $cache->setAccessible(true);
    $cache->setValue(null, null);
});

/**
 * Order with its first installment paid, so its detail can be advanced
 * through production stages.
 */
function stickerOrder(): Order
{
    $order = Order::factory()->create(['total_price' => 64000, 'payment_plan' => 4]);
    $order->payments()->create(['amount' => 16000, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);

    return $order;
}

/**
 * Order with its single active detail advanced to the last stage of its
 * (one-stage) product, so `Order::isFinished()` reports true.
 */
function finishedOrder(): Order
{
    $product = productWithChain(['Impreso']);
    $order = stickerOrder();
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'production_status_id' => stageOf($product, 1)->id,
        'production_enabled_at' => now(),
    ]);

    return $order;
}

/**
 * Order whose detail is enabled but not yet at the last stage of its
 * (two-stage) product, so `Order::isFinished()` reports false.
 */
function notFinishedOrder(): Order
{
    $product = productWithChain(['Impreso', 'Pegado']);
    $order = stickerOrder();
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'production_status_id' => stageOf($product, 1)->id,
        'production_enabled_at' => now(),
    ]);

    return $order;
}

it('flags finished and not-finished orders on the index page', function () {
    $finished = finishedOrder();
    $notFinished = notFinishedOrder();

    get(route('stickers.index'))->assertInertia(
        fn (Assert $page) => $page
            ->component('stickers/index')
            ->has('orders', 2)
            ->where('orders.0.id', $finished->id)
            ->where('orders.0.is_finished', true)
            ->where('orders.1.id', $notFinished->id)
            ->where('orders.1.is_finished', false),
    );
});

it('prints the sticker sheet for a finished order', function () {
    $order = finishedOrder();

    get(route('stickers.print', ['ids' => [$order->id]]))->assertInertia(
        fn (Assert $page) => $page
            ->component('stickers/print')
            ->has('orders', 1)
            ->where('orders.0.child_name', $order->child_name)
            ->where('orders.0.order_number', $order->id),
    );
});

it('excludes recycled details from a finished order sticker', function () {
    $order = finishedOrder();
    $activeProductName = $order->details()->firstOrFail()->product->name;

    $recycledProduct = productWithChain(['Reciclado']);
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $recycledProduct->id,
        'production_status_id' => stageOf($recycledProduct, 1)->id,
        'production_enabled_at' => now(),
        'recycled_to' => 'reciclaje',
    ]);

    get(route('stickers.print', ['ids' => [$order->id]]))->assertInertia(
        fn (Assert $page) => $page
            ->component('stickers/print')
            ->has('orders', 1)
            ->has('orders.0.products', 1)
            ->where('orders.0.products.0.name', $activeProductName),
    );
});

it('filters out not-finished orders even when their id is requested', function () {
    $finished = finishedOrder();
    $notFinished = notFinishedOrder();

    get(route('stickers.print', ['ids' => [$finished->id, $notFinished->id]]))->assertInertia(
        fn (Assert $page) => $page
            ->component('stickers/print')
            ->has('orders', 1)
            ->where('orders.0.id', $finished->id),
    );
});

it('returns an empty orders prop when printing without ids', function () {
    get(route('stickers.print'))->assertInertia(
        fn (Assert $page) => $page
            ->component('stickers/print')
            ->has('orders', 0),
    );
});

it('rejects non-integer ids when printing', function () {
    get(route('stickers.print', ['ids' => ['abc']]))->assertSessionHasErrors('ids.0');
});
