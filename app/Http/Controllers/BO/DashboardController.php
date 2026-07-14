<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $startOfMonth = now()->startOfMonth();

        $activeOrders = Order::query()->whereNull('cancelled_at');

        $ordersThisMonth = (clone $activeOrders)->where('created_at', '>=', $startOfMonth);

        $salesThisMonth = [
            'count' => (clone $ordersThisMonth)->count(),
            'total' => (int) (clone $ordersThisMonth)->sum('total_price'),
        ];

        $collectedThisMonth = (int) Payment::query()
            ->where('paid_on', '>=', $startOfMonth)
            ->whereHas('order', fn ($q) => $q->whereNull('cancelled_at'))
            ->sum('amount');

        $totalSold = (int) (clone $activeOrders)->sum('total_price');
        $totalCollected = (int) Payment::query()
            ->whereHas('order', fn ($q) => $q->whereNull('cancelled_at'))
            ->sum('amount');

        // Production: pending details of active, undelivered orders. Details
        // whose production is not enabled yet (first installment unpaid) are
        // not workshop work, so they stay out of these metrics.
        $activeDetails = OrderDetail::query()
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->whereNotNull('production_enabled_at')
            ->whereHas('order', fn ($q) => $q->whereNull('cancelled_at'));

        /** @var array<int, int> $lastPositions */
        $lastPositions = ProductionStatus::query()
            ->selectRaw('product_id, MAX(position) as last_position')
            ->groupBy('product_id')
            ->pluck('last_position', 'product_id')
            ->all();

        $detailsByStatus = (clone $activeDetails)
            ->with('product.type', 'productionStatus')
            ->get()
            ->groupBy(function (OrderDetail $detail) use ($lastPositions) {
                if ($detail->production_status_id === null) {
                    return 'sin empezar';
                }

                /** @var ProductionStatus $status */
                $status = $detail->productionStatus;

                return $status->position === ($lastPositions[$status->product_id] ?? 0)
                    ? 'listo para entregar'
                    : 'en producción';
            })
            ->map(fn ($group) => $group->count());

        // Overdue orders: paid less than the installments already due. The
        // schedule runs month to month from the first due date, so a client
        // who paid the first installment is up to date until the next one.
        $today = now()->startOfDay();

        $overdueOrders = (clone $activeOrders)
            ->with('client', 'classroom.school')
            ->withSum('payments', 'amount')
            ->where('due_date', '<', $today)
            ->get()
            ->filter(fn (Order $order) => ((int) $order->payments_sum_amount) < $order->amountOverdue($today))
            ->sortBy('due_date')
            ->take(8)
            ->values()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'client' => $order->client?->name,
                'child_name' => $order->child_name,
                'school' => $order->classroom?->school?->name,
                'due_date' => $order->due_date->format('d/m/Y'),
                'balance' => $order->total_price - (int) $order->payments_sum_amount,
            ]);

        $stockAlerts = Stockable::query()
            ->whereColumn('quantity', '<=', 'alert_at')
            ->get(['id', 'name', 'quantity', 'unit', 'alert_at']);

        return Inertia::render('dashboard', [
            'metrics' => [
                'sales_this_month' => $salesThisMonth,
                'collected_this_month' => $collectedThisMonth,
                'outstanding_balance' => $totalSold - $totalCollected,
                'production' => [
                    'sin_empezar' => $detailsByStatus->get('sin empezar', 0),
                    'en_produccion' => $detailsByStatus->get('en producción', 0),
                    'listo_para_entregar' => $detailsByStatus->get('listo para entregar', 0),
                ],
            ],
            'overdueOrders' => $overdueOrders,
            'stockAlerts' => $stockAlerts,
        ]);
    }
}
