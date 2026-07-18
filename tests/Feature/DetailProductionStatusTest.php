<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Stockable;
use App\Models\StockMovement;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\put;

/**
 * Order with its first installment (total / plan) already paid, so
 * production can be enabled (#106).
 */
function orderWithFirstInstallmentPaid(): Order
{
    $order = Order::factory()->create(['total_price' => 64000, 'payment_plan' => 4]);
    $order->payments()->create(['amount' => 16000, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);

    return $order;
}

it('refuses to enable production before the first installment is paid', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create(['total_price' => 64000, 'payment_plan' => 4]);
    $order->payments()->create(['amount' => 15999, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasErrors('order');

    expect($detail->refresh()->production_enabled_at)->toBeNull();
});

it('enables a detail as "sin empezar" once the first installment is paid', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasNoErrors();

    $detail->refresh();
    expect($detail->production_enabled_at)->not->toBeNull()
        ->and($detail->production_status_id)->toBeNull();
});

it('keeps a not-enabled detail out of tracking and shows it once enabled', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page->has('details', 0),
    );

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ]);

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page
            ->has('details', 1)
            ->where('details.0.id', $detail->id)
            ->where('details.0.production_status_id', null),
    );
});

it('moves a detail to a stage of its product, deducting the stage stock', function () {
    actingAsRole(UserRole::Office);

    $product = productWithChain(['Impreso', 'Pegado']);
    $planchas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($planchas->id, ['quantity' => -2]);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
    ])->assertSessionHasNoErrors();

    $detail->refresh();
    expect($detail->production_status_id)->toBe(stageOf($product, 2)->id)
        ->and($detail->production_enabled_at)->not->toBeNull()
        ->and($planchas->refresh()->quantity)->toBe(8);
});

it('returns a detail to "sin empezar" without giving the stock back', function () {
    actingAsRole(UserRole::Office);

    $product = productWithChain(['Impreso', 'Pegado']);
    $planchas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($planchas->id, ['quantity' => -2]);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasNoErrors();

    $detail->refresh();
    expect($detail->production_status_id)->toBeNull()
        ->and($detail->production_enabled_at)->not->toBeNull()
        ->and($planchas->refresh()->quantity)->toBe(8);
});

it('rejects a stage that belongs to another product', function () {
    actingAsRole(UserRole::Office);

    $mural = productWithChain();
    $taza = productWithChain();

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $taza->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($mural, 1)->id,
    ])->assertSessionHasErrors('detail_ids');

    expect($detail->refresh()->production_status_id)->toBeNull();
});

it('rejects a detail that belongs to another order', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $foreign = OrderDetail::factory()->create();

    put(route('orders.production-status', $order), [
        'detail_id' => $foreign->id,
        'production_status_id' => null,
    ])->assertSessionHasErrors('detail_id');

    expect($foreign->refresh()->production_enabled_at)->toBeNull();
});

it('rejects delivered and recycled details', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $delivered = OrderDetail::factory()->delivered()->create(['order_id' => $order->id]);
    $recycled = OrderDetail::factory()->recycled()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $delivered->id,
        'production_status_id' => null,
    ])->assertSessionHasErrors('detail_id');

    put(route('orders.production-status', $order), [
        'detail_id' => $recycled->id,
        'production_status_id' => null,
    ])->assertSessionHasErrors('detail_id');
});

it('rejects a cancelled order', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->cancelled()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasErrors('order');

    expect($detail->refresh()->production_enabled_at)->toBeNull();
});

it('disables production, clearing production_enabled_at', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
        'disable_production' => true,
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->production_enabled_at)->toBeNull();
});

it('preserves the reached stage when disabling production', function () {
    actingAsRole(UserRole::Office);

    $product = productWithChain(['Impreso', 'Pegado']);
    $planchas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($planchas->id, ['quantity' => -2]);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
        'disable_production' => true,
    ])->assertSessionHasNoErrors();

    $detail->refresh();
    expect($detail->production_enabled_at)->toBeNull()
        ->and($detail->production_status_id)->toBe(stageOf($product, 2)->id);
});

it('creates no stock movement when disabling production', function () {
    actingAsRole(UserRole::Office);

    $product = productWithChain(['Impreso', 'Pegado']);
    $planchas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($planchas->id, ['quantity' => -2]);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    $countBeforeDisable = StockMovement::count();

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
        'disable_production' => true,
    ])->assertSessionHasNoErrors();

    expect(StockMovement::count())->toBe($countBeforeDisable)
        ->and($planchas->refresh()->quantity)->toBe(8);
});

it('removes a disabled detail from tracking', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ]);

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page->has('details', 1),
    );

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
        'disable_production' => true,
    ]);

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page->has('details', 0),
    );
});

it('re-enables a disabled detail without creating duplicate stock movements', function () {
    actingAsRole(UserRole::Office);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    $countBeforeRoundTrip = StockMovement::count();

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
        'disable_production' => true,
    ])->assertSessionHasNoErrors();

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasNoErrors();

    expect(StockMovement::count())->toBe($countBeforeRoundTrip)
        ->and($detail->refresh()->production_enabled_at)->not->toBeNull();
});

it('restores the preserved stage when re-enabling a detail disabled at that stage', function () {
    actingAsRole(UserRole::Office);

    $product = productWithChain(['Impreso', 'Pegado']);
    $planchas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($planchas->id, ['quantity' => -2]);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => stageOf($product, 2)->id,
        'disable_production' => true,
    ]);

    $countBeforeReEnable = StockMovement::count();

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertSessionHasNoErrors();

    $detail->refresh();
    expect($detail->production_status_id)->toBe(stageOf($product, 2)->id)
        ->and($detail->production_enabled_at)->not->toBeNull()
        ->and(StockMovement::count())->toBe($countBeforeReEnable);
});

it('rejects disabling production on a cancelled order', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->cancelled()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
        'disable_production' => true,
    ])->assertSessionHasErrors('order');
});

it('disables production even when the first installment is no longer paid', function () {
    actingAsRole(UserRole::Office);

    $order = Order::factory()->create(['total_price' => 64000, 'payment_plan' => 4]);
    $order->payments()->create(['amount' => 16000, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ]);

    // The installment is no longer considered paid once refunded below
    // the gate threshold, but the disable branch runs before that gate.
    $order->payments()->delete();

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
        'disable_production' => true,
    ])->assertSessionHasNoErrors();

    expect($detail->refresh()->production_enabled_at)->toBeNull();
});

it('denies the workshop role, which changes stages from tracking instead', function () {
    actingAsRole(UserRole::Worker);

    $order = orderWithFirstInstallmentPaid();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id]);

    put(route('orders.production-status', $order), [
        'detail_id' => $detail->id,
        'production_status_id' => null,
    ])->assertForbidden();

    expect($detail->refresh()->production_enabled_at)->toBeNull();
});
