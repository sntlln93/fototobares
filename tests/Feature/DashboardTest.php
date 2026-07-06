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
