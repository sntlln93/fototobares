<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePayment($request);

        $order = Order::findOrFail($validated['order_id']);

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

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $this->validatePayment($request);

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

    /**
     * @return array{order_id: int, amount: float, type: string, proof_of_payment?: mixed}
     */
    private function validatePayment(Request $request): array
    {
        return $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
            'type' => 'required|string|max:255',
            'proof_of_payment' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);
    }
}
