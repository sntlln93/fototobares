<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\School;
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
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => -2]);
    stageOf($product, 3)->stockables()->attach($bolsas->id, ['quantity' => -1]);

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
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => -2]);
    stageOf($product, 3)->stockables()->attach($bolsas->id, ['quantity' => -1]);

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
    stageOf($product, 2)->stockables()->attach($tiras->id, ['quantity' => -2]);

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

it('adds stock for a stage with a positive delta', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pegado', 'Pintado']);
    $armados = Stockable::factory()->create(['quantity' => 0]);
    stageOf($product, 1)->stockables()->attach($armados->id, ['quantity' => 1]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    expect($armados->refresh()->quantity)->toBe(1)
        ->and($armados->movements()->count())->toBe(1)
        ->and($armados->movements()->first()?->quantity)->toBe(1)
        ->and($armados->movements()->first()?->production_status_id)->toBe(stageOf($product, 1)->id);
});

it('mixes a subtraction and an addition on the same stage', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pegado']);
    $mdf = Stockable::factory()->create(['quantity' => 10]);
    $armados = Stockable::factory()->create(['quantity' => 0]);
    stageOf($product, 1)->stockables()->attach($mdf->id, ['quantity' => -2]);
    stageOf($product, 1)->stockables()->attach($armados->id, ['quantity' => 1]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    expect($mdf->refresh()->quantity)->toBe(8)
        ->and($armados->refresh()->quantity)->toBe(1);
});

it('stays idempotent per stage across a pipeline of adds and subtracts', function () {
    actingAsRole(UserRole::Worker);

    $product = productWithChain(['Pendiente', 'Pegado', 'Pintado']);
    $armados = Stockable::factory()->create(['quantity' => 0]);
    stageOf($product, 2)->stockables()->attach($armados->id, ['quantity' => 1]);
    stageOf($product, 3)->stockables()->attach($armados->id, ['quantity' => -1]);

    $detail = OrderDetail::factory()->create(['product_id' => $product->id]);

    // Jumping straight to the last stage applies both stages exactly once
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 3)->id,
    ]);

    expect($armados->refresh()->quantity)->toBe(0)
        ->and($armados->movements()->count())->toBe(2);

    // Going back and forward again does not apply either stage twice
    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 1)->id,
    ]);

    post(route('tracking.batch'), [
        'detail_ids' => [$detail->id],
        'production_status_id' => stageOf($product, 3)->id,
    ]);

    expect($armados->refresh()->quantity)->toBe(0)
        ->and($armados->movements()->count())->toBe(2);
});

it('lists only enabled, pending details of active orders', function () {
    actingAsRole(UserRole::Worker);

    $pending = OrderDetail::factory()->enabled()->create();
    OrderDetail::factory()->delivered()->create();
    OrderDetail::factory()->recycled()->create();
    OrderDetail::factory()->enabled()->create([
        'order_id' => Order::factory()->cancelled()->create()->id,
    ]);
    // Production not enabled yet: the first installment gates it (#106)
    OrderDetail::factory()->create();

    get(route('tracking.index'))->assertInertia(
        fn (Assert $page) => $page
            ->component('tracking/index')
            ->has('details', 1)
            ->where('details.0.id', $pending->id),
    );
});

it('filters the board by classroom, narrower than its school', function () {
    actingAsRole(UserRole::Worker);

    $school = School::factory()->create();
    $classroom = Classroom::factory()->create(['school_id' => $school->id]);
    $sibling = Classroom::factory()->create(['school_id' => $school->id]);

    $detail = OrderDetail::factory()->enabled()->create([
        'order_id' => Order::factory()->create(['classroom_id' => $classroom->id])->id,
    ]);
    OrderDetail::factory()->enabled()->create([
        'order_id' => Order::factory()->create(['classroom_id' => $sibling->id])->id,
    ]);
    OrderDetail::factory()->enabled()->create();

    get(route('tracking.index', ['school_id' => $school->id]))->assertInertia(
        fn (Assert $page) => $page->has('details', 2),
    );

    get(route('tracking.index', ['classroom_id' => $classroom->id]))->assertInertia(
        fn (Assert $page) => $page
            ->has('details', 1)
            ->where('details.0.id', $detail->id),
    );
});

it('combines the classroom filter with the product type filter', function () {
    actingAsRole(UserRole::Worker);

    $classroom = Classroom::factory()->create();
    $order = Order::factory()->create(['classroom_id' => $classroom->id]);

    $mural = Product::factory()->mural()->create();
    $detail = OrderDetail::factory()->enabled()->create([
        'order_id' => $order->id,
        'product_id' => $mural->id,
    ]);
    // Same classroom, default product type (taza): the type filter drops it
    OrderDetail::factory()->enabled()->create(['order_id' => $order->id]);

    get(route('tracking.index', [
        'classroom_id' => $classroom->id,
        'product_type_id' => $mural->product_type_id,
    ]))->assertInertia(
        fn (Assert $page) => $page
            ->has('details', 1)
            ->where('details.0.id', $detail->id),
    );
});
