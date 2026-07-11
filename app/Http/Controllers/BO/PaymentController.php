<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StorePaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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

        $proof = $request->file('proof_of_payment');

        if ($proof instanceof UploadedFile) {
            $validated['proof_of_payment'] = $proof->store('proofs', 'public');
        }

        unset($validated['order_id']);
        $order->payments()->create($validated);

        return redirect()->route('orders.show', ['order' => $order->id])->with('message', 'Pago registrado exitosamente.');
    }

    public function update(StorePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validated();

        $proof = $request->file('proof_of_payment');

        if ($proof instanceof UploadedFile) {
            if ($payment->proof_of_payment !== null) {
                Storage::disk('public')->delete($payment->proof_of_payment);
            }

            $validated['proof_of_payment'] = $proof->store('proofs', 'public');
        }

        unset($validated['order_id']);
        $payment->update($validated);

        return redirect()->route('orders.show', ['order' => $payment->order_id])->with('message', 'Pago modificado exitosamente.');
    }
}
