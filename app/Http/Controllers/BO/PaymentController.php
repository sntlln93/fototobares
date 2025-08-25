<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $this->validate($request);

        // if ($request->hasFile('proof_of_payment')) {
        //     $path = $request->file('proof_of_payment')->store('proofs', 'public');
        //     $validated['proof_of_payment'] = $path;
        // }

        $order = Order::findOrFail($validated['order_id']);
        $order->payments()->create($validated);

        return redirect()->route('orders.show', ['order' => $order->id])->with('message', 'Pago registrado exitosamente.');
    }

    public function update(Request $request, Payment $payment): \Illuminate\Http\RedirectResponse
    {
        $validated = $this->validate($request);

        // if ($request->hasFile('proof_of_payment')) {
        //     $path = $request->file('proof_of_payment')->store('proofs', 'public');
        //     $validated['proof_of_payment'] = $path;
        // }

        $payment->update($validated);

        return redirect()->route('orders.show', ['order' => $payment->order_id])->with('message', 'Pago modificado exitosamente.');
    }

    /**
     * @return array{order_id: int, amount: float, type: string}
     */
    private function validate(Request $request): array
    {
        return $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
            'type' => 'required|string|max:255',
        ]);
    }
}
