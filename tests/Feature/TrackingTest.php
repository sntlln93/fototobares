<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Stockable;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

it('updates the status of a batch of details', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain();
    $details = OrderDetail::factory()->count(2)->create(['product_id' => $product->id]);

    post(route('tracking.batch'), [
        'detail_ids' => $details->pluck('id')->all(),
        'production_status_id' => stageOf($product, 1)->id,
    ])->assertSessionHasNoErrors();

    foreach ($details as $detail) {
        $detail->refresh();
        expect($detail->production_status_id)->toBe(stageOf($product, 1)->id)
            ->and($detail->status_updated_at)->not->toBeNull()
            ->and($detail->priority)->toBeFalse();
    }
});

it('does not flag priority when a detail moves backwards', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain();
    $detail = OrderDetail::factory()->create([
        'product_id' => $product->id,
        'production_status_id' => stageOf($product, 3)->id,
    ]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    expect($detail->refresh()->production_status_id)->toBe(stageOf($product, 1)->id)
        ->and($detail->priority)->toBeFalse();
});

it('keeps a manual priority when the detail moves', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain();
    $detail = OrderDetail::factory()->create([
        'product_id' => $product->id,
        'priority' => true,
    ]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    expect($detail->refresh()->priority)->toBeTrue();
});

it('rejects a stage that belongs to another product', function () {
    actingAsRole(UserRole::Worker);

    $mural = productWithChain();
    $taza = productWithChain();
    $detail = OrderDetail::factory()->create(['product_id' => $taza->id]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($mural, 1)->id,
    ])->assertSessionHasErrors('detail_ids');

    expect($detail->refresh()->production_status_id)->toBeNull();
});

it('deducts the stockables hung from the reached stages', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pendiente', 'Corte', 'Embolsado']);
    $tiras = Stockable::factory()->create(['quantity' => 10]);
    $bolsas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => 2]);
    stageOf($product, 3)->stockables()->attach($bolsas->id, ['quantity' => 1]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    // The first stage consumes nothing
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(10)
        ->and($bolsas->refresh()->quantity)->toBe(10);

    // Reaching "Corte" consumes the configured 2 strips
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(8)
        ->and($bolsas->refresh()->quantity)->toBe(10);

    // Reaching the last stage consumes the bag but not the strips again
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 3)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(8)
        ->and($bolsas->refresh()->quantity)->toBe(9)
        ->and($tiras->movements()->count())->toBe(1)
        ->and($tiras->movements()->first()?->quantity)->toBe(-2);
});

it('deducts the skipped stages on a batch jump', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pendiente', 'Corte', 'Embolsado']);
    $tiras = Stockable::factory()->create(['quantity' => 10]);
    $bolsas = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => 2]);
    stageOf($product, 3)->stockables()->attach($bolsas->id, ['quantity' => 1]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    // Jumping straight to the last stage consumes everything in between
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 3)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(8)
        ->and($bolsas->refresh()->quantity)->toBe(9);
});

it('never deducts twice when moving back and forth', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pendiente', 'Corte', 'Embolsado']);
    $tiras = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => 2]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    // Going back does not return stock...
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(8);

    // ...and reaching the stage again does not deduct twice
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 2)->id,
    ]);

    expect($tiras->refresh()->quantity)->toBe(8)
        ->and($tiras->movements()->count())->toBe(1);
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
