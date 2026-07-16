<?php

declare(strict_types=1);

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Stockable;
use App\Services\StockService;

it('marks a product with deducted supplies as returnable', function () {
    actingAsRole();

    $product = productWithChain(['Pendiente', 'Corte', 'Embolsado']);
    $stockable = Stockable::factory()->create(['quantity' => 10]);
    stageOf($product, 2)->stockables()->attach($stockable->id, ['quantity' => -2]);

    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'production_status_id' => stageOf($product, 2)->id,
    ]);
    app(StockService::class)->applyForDetail($detail);

    // Load the order the same way the controller does
    $order->load([
        'client',
        'products.type',
        'products.productionStatuses',
        'payments',
        'notes',
        'classroom.school',
        'details' => fn ($query) => $query->withCount('stockMovements')->with('productionStatus'),
    ]);

    $resource = new OrderResource($order);
    $data = $resource->resolve();

    expect($data['products'])->toHaveCount(1)
        ->and($data['products'][0]['order_detail_id'])->toBe($detail->id)
        ->and($data['products'][0]['has_returnable_stock'])->toBe(true);
});

it('marks a product that never started production as not returnable', function () {
    actingAsRole();

    $product = productWithChain();
    $order = Order::factory()->create();
    $detail = OrderDetail::factory()->create(['order_id' => $order->id, 'product_id' => $product->id]);

    // Load the order the same way the controller does
    $order->load([
        'client',
        'products.type',
        'products.productionStatuses',
        'payments',
        'notes',
        'classroom.school',
        'details' => fn ($query) => $query->withCount('stockMovements')->with('productionStatus'),
    ]);

    $resource = new OrderResource($order);
    $data = $resource->resolve();

    expect($data['products'])->toHaveCount(1)
        ->and($data['products'][0]['order_detail_id'])->toBe($detail->id)
        ->and($data['products'][0]['has_returnable_stock'])->toBe(false);
});
