<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\Stockable;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

it('updates the status of a batch of details', function () {
    actingAsRole(UserRole::Worker);

    $product = Product::factory()->mural()->create();
    $details = OrderDetail::factory()->count(2)->create(['product_id' => $product->id]);

    post(route('tracking.batch'), [
        'detail_ids' => $details->pluck('id')->all(),
        'production_status_id' => statusFor('mural', 1)->id,
    ])->assertSessionHasNoErrors();

    foreach ($details as $detail) {
        $detail->refresh();
        expect($detail->production_status_id)->toBe(statusFor('mural', 1)->id)
            ->and($detail->status_updated_at)->not->toBeNull()
            ->and($detail->priority)->toBeFalse();
    }
});

it('flags priority when a detail moves backwards and keeps it afterwards', function () {
    actingAsRole(UserRole::Worker);

    $product = Product::factory()->mural()->create();
    $detail = OrderDetail::factory()->create([
        'product_id' => $product->id,
        'production_status_id' => statusFor('mural', 3)->id,
    ]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 1)->id,
    ]);

    expect($detail->refresh()->priority)->toBeTrue();

    // Moving forward again keeps the priority flag (sticky)
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 2)->id,
    ]);

    expect($detail->refresh()->priority)->toBeTrue();
});

it('rejects a status that belongs to another product type', function () {
    actingAsRole(UserRole::Worker);

    $taza = Product::factory()->create(); // type: taza
    $detail = OrderDetail::factory()->create(['product_id' => $taza->id]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 1)->id,
    ])->assertSessionHasErrors('detail_ids');

    expect($detail->refresh()->production_status_id)->toBeNull();
});

it('deducts stock once when production starts', function () {
    actingAsRole(UserRole::Worker);

    $product = Product::factory()->mural()->create();
    $stockable = Stockable::factory()->create(['quantity' => 10]);
    $product->stockables()->attach($stockable->id);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    // Position 1 does not start production: no deduction
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 1)->id,
    ]);

    expect($stockable->refresh()->quantity)->toBe(10);

    // Position 2 starts production: deducts one unit
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 2)->id,
    ]);

    expect($stockable->refresh()->quantity)->toBe(9)
        ->and($detail->refresh()->stock_deducted_at)->not->toBeNull();

    // Advancing further does not deduct again
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => statusFor('mural', 3)->id,
    ]);

    expect($stockable->refresh()->quantity)->toBe(9)
        ->and($stockable->movements()->count())->toBe(1)
        ->and($stockable->movements()->first()?->reason)->toBe('producción');
});

it('lists only pending details of active orders', function () {
    actingAsRole(UserRole::Worker);

    $pending = OrderDetail::factory()->create();
    OrderDetail::factory()->delivered()->create();
    OrderDetail::factory()->recycled()->create();
    OrderDetail::factory()->create([
        'order_id' => Order::factory()->cancelled()->create()->id,
    ]);

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page
            ->component('tracking/index')
            ->has('details', 1)
            ->where('details.0.id', $pending->id),
    );
});
