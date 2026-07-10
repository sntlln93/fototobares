<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    public function index(): Response
    {
        $movements = StockMovement::query()
            ->with('stockable', 'user', 'orderDetail.order.client', 'orderDetail.product')
            ->latest()
            ->paginate(50);

        return Inertia::render('stock/movements', [
            'movements' => $movements->through(fn (StockMovement $movement) => [
                'id' => $movement->id,
                'stockable' => $movement->stockable?->name,
                'quantity' => $movement->quantity,
                'reason' => $movement->reason,
                'user' => $movement->user?->name,
                'order_id' => $movement->orderDetail?->order_id,
                'product' => $movement->orderDetail?->product?->name,
                'created_at' => $movement->created_at?->format('d/m/Y H:i'),
            ]),
        ]);
    }
}
