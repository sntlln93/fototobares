<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\SetDetailProductionStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\UpdateDetailProductionStatusRequest;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class DetailProductionStatusController extends Controller
{
    /**
     * Change the production status of a detail from the order page: enable
     * production once the first installment is paid, or move the detail to a
     * stage of its product's chain.
     */
    public function update(UpdateDetailProductionStatusRequest $request, Order $order, SetDetailProductionStatusAction $action): RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $action->handle($request->toData($order, $user));

        return back()->with('success', 'Estado de fabricación actualizado');
    }
}
