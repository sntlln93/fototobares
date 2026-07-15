<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\UpdateDetailVariantAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\UpdateDetailVariantRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;

class DetailVariantController extends Controller
{
    /**
     * Sets a detail's variant, informative only (does not gate production).
     * Editable regardless of payment status, unlike the rest of the order.
     */
    public function update(UpdateDetailVariantRequest $request, Order $order, UpdateDetailVariantAction $action): RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        $action->handle($request->toData($order));

        return back()->with('success', 'Variante actualizada');
    }
}
