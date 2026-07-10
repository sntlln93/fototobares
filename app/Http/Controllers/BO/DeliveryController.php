<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * Mark (or unmark) order details as delivered.
     * The "not fully paid" warning is confirmed client-side and can be ignored.
     */
    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'detail_ids' => ['required', 'array', 'min:1'],
            'detail_ids.*' => ['required', 'integer'],
            'action' => ['required', 'in:deliver,undeliver'],
        ]);

        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede registrar entregas de un pedido cancelado.']);
        }

        $details = $order->details()
            ->whereIn('id', $validated['detail_ids'])
            ->whereNull('recycled_to')
            ->get();

        if ($details->isEmpty()) {
            return back()->withErrors(['detail_ids' => 'No se encontraron productos para entregar en este pedido.']);
        }

        DB::transaction(function () use ($details, $validated) {
            foreach ($details as $detail) {
                $detail->delivered_at = $validated['action'] === 'deliver' ? now() : null;
                $detail->save();
            }
        });

        $message = $validated['action'] === 'deliver'
            ? 'Entrega registrada exitosamente'
            : 'Entrega deshecha';

        return back()->with('success', $message);
    }
}
