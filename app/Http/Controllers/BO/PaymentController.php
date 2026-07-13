<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StorePaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var int $orderId */
        $orderId = $validated['order_id'];

        $order = Order::findOrFail($orderId);

        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order_id' => 'No se pueden registrar pagos de un pedido cancelado.']);
        }

        unset($validated['order_id']);
        $order->payments()->create($validated);

        return redirect()->route('orders.show', ['order' => $order->id])->with('message', 'Pago registrado exitosamente.');
    }

    public function update(StorePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validated();

        unset($validated['order_id']);
        $payment->update($validated);

        return redirect()->route('orders.show', ['order' => $payment->order_id])->with('message', 'Pago modificado exitosamente.');
    }
}
