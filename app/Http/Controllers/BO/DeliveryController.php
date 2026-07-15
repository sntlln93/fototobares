<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Deliveries\MarkDeliveries;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\UpdateDeliveryRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;

class DeliveryController extends Controller
{
    /**
     * Mark (or unmark) order details as delivered.
     * The "not fully paid" warning is confirmed client-side and can be ignored.
     */
    public function update(UpdateDeliveryRequest $request, Order $order, MarkDeliveries $action): RedirectResponse
    {
        $data = $request->toData($order);

        $action->handle($data);

        $message = $data->action === 'deliver'
            ? 'Entrega registrada exitosamente'
            : 'Entrega deshecha';

        return back()->with('success', $message);
    }
}
