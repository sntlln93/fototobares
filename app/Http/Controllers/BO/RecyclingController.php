<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use Inertia\Inertia;

class RecyclingController extends Controller
{
    public function index(): \Inertia\Response
    {
        $details = OrderDetail::query()
            ->with('product.type', 'productionStatus', 'order.client', 'order.classroom.school')
            ->whereNotNull('recycled_to')
            ->latest('updated_at')
            ->paginate(50);

        return Inertia::render('recycling/index', [
            'items' => $details->through(function (OrderDetail $detail) {
                /** @var \App\Models\Order $order */
                $order = $detail->order;

                return [
                    'id' => $detail->id,
                    'order_id' => $detail->order_id,
                    'client_name' => $order->client?->name,
                    'child_name' => $order->child_name,
                    'school' => $order->classroom?->school?->name,
                    'classroom' => $order->classroom?->name,
                    'product_name' => $detail->product?->name,
                    'product_type' => $detail->product?->type?->name,
                    'variant' => $detail->variant,
                    'note' => $detail->note,
                    'destination' => $detail->recycled_to,
                    'last_status' => $detail->productionStatus?->name,
                    'recycled_at' => $detail->updated_at?->format('d/m/Y'),
                ];
            }),
        ]);
    }
}
