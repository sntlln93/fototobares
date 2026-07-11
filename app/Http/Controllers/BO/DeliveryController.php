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
        $validated = $request->validated();

        /** @var array<int, int> $detailIds */
        $detailIds = $validated['detail_ids'];

        /** @var string $deliveryAction */
        $deliveryAction = $validated['action'];

        $action->handle([
            'order' => $order,
            'detail_ids' => $detailIds,
            'action' => $deliveryAction,
        ]);

        $message = $deliveryAction === 'deliver'
            ? 'Entrega registrada exitosamente'
            : 'Entrega deshecha';

        return back()->with('success', $message);
    }
}
