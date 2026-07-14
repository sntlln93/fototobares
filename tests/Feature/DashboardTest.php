<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\Stockable;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\get;

it('computes the dashboard metrics', function () {
    actingAsRole();

    // Venta del mes con un pago parcial y productos en distintas etapas
    $order = Order::factory()->create(['total_price' => 64000]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 16000]);

    OrderDetail::factory()->create(['order_id' => $order->id]); // sin empezar
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'production_status_id' => statusFor('taza', 2)->id, // en producción
    ]);
    OrderDetail::factory()->create([
        'order_id' => $order->id,
        'production_status_id' => statusFor('taza', 4)->id, // último estado
    ]);

    // Cancelado: excluido de todas las métricas
    Order::factory()->cancelled()->create(['total_price' => 12000]);

    // Vencido de un mes anterior con saldo pendiente
    $overdue = Order::factory()->overdue()->create([
        'total_price' => 20000,
        'created_at' => now()->subMonths(2),
    ]);

    // Alertas de stock: solo el que está en o bajo su umbral
    Stockable::factory()->create(['quantity' => 3, 'alert_at' => 5]);
    Stockable::factory()->create(['quantity' => 10, 'alert_at' => 5]);

    get(route('dashboard'))->assertInertia(
        fn (Assert $page) => $page
            ->component('dashboard')
            ->where('metrics.sales_this_month.count', 1)
            ->where('metrics.sales_this_month.total', 64000)
            ->where('metrics.collected_this_month', 16000)
            ->where('metrics.outstanding_balance', 68000)
            ->where('metrics.production.sin_empezar', 1)
            ->where('metrics.production.en_produccion', 1)
            ->where('metrics.production.listo_para_entregar', 1)
            ->has('overdueOrders', 1)
            ->where('overdueOrders.0.id', $overdue->id)
            ->where('overdueOrders.0.balance', 20000)
            ->has('stockAlerts', 1),
    );
});

it('does not list fully paid orders as overdue', function () {
    actingAsRole();

    $paid = Order::factory()->overdue()->create(['total_price' => 10000]);
    Payment::factory()->create(['order_id' => $paid->id, 'amount' => 10000]);

    get(route('dashboard'))->assertInertia(
        fn (Assert $page) => $page->has('overdueOrders', 0),
    );
});

it('does not list an order that paid every installment already due', function () {
    actingAsRole();

    // Venció la primera cuota; la segunda vence recién el mes que viene
    $upToDate = Order::factory()->create([
        'total_price' => 20000,
        'payment_plan' => 4,
        'due_date' => now()->subDays(10)->format('Y-m-d'),
    ]);
    Payment::factory()->create(['order_id' => $upToDate->id, 'amount' => 5000]);

    get(route('dashboard'))->assertInertia(
        fn (Assert $page) => $page->has('overdueOrders', 0),
    );
});

it('lists an order that fell behind on a later installment', function () {
    actingAsRole();

    // Vencieron tres cuotas (mes a mes desde el primer vencimiento), pagó una
    $behind = Order::factory()->create([
        'total_price' => 20000,
        'payment_plan' => 4,
        'due_date' => now()->subMonths(2)->subDays(10)->format('Y-m-d'),
    ]);
    Payment::factory()->create(['order_id' => $behind->id, 'amount' => 5000]);

    get(route('dashboard'))->assertInertia(
        fn (Assert $page) => $page
            ->has('overdueOrders', 1)
            ->where('overdueOrders.0.id', $behind->id)
            ->where('overdueOrders.0.balance', 15000),
    );
});

it('stops counting installments once the plan is complete', function () {
    actingAsRole();

    // Plan de 2 cuotas vencido hace un año: se debe el total, no más
    $order = Order::factory()->create([
        'total_price' => 10000,
        'payment_plan' => 2,
        'due_date' => now()->subYear()->format('Y-m-d'),
    ]);
    Payment::factory()->create(['order_id' => $order->id, 'amount' => 10000]);

    get(route('dashboard'))->assertInertia(
        fn (Assert $page) => $page->has('overdueOrders', 0),
    );
});
