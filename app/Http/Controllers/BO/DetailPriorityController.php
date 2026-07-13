<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\SetDetailPriority;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\UpdateDetailPriorityRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;

class DetailPriorityController extends Controller
{
    /**
     * Flag (or unflag) a detail of an order as priority, so the workshop
     * produces it first.
     */
    public function update(UpdateDetailPriorityRequest $request, Order $order, SetDetailPriority $action): RedirectResponse
    {
        $validated = $request->validated();

        /** @var int $detailId */
        $detailId = $validated['detail_id'];

        /** @var bool $priority */
        $priority = $validated['priority'];

        $action->handle([
            'order' => $order,
            'detail_id' => $detailId,
            'priority' => $priority,
        ]);

        $message = $priority
            ? 'Producto marcado como prioritario'
            : 'Prioridad quitada';

        return back()->with('success', $message);
    }
}
