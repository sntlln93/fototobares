<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\EditingStatus\ChangeEditingStatusAction;
use App\Actions\EditingStatus\RevertEditingStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\ChangeEditingStatusRequest;
use App\Http\Requests\BO\RevertEditingStatusRequest;
use App\Models\OrderDetail;
use Illuminate\Http\RedirectResponse;

class EditingStatusController extends Controller
{
    /**
     * Append a new editing status entry for an order detail.
     */
    public function store(ChangeEditingStatusRequest $request, OrderDetail $orderDetail, ChangeEditingStatusAction $action): RedirectResponse
    {
        $action->handle($request->toData());

        return back()->with('success', 'Estado de edición actualizado');
    }

    /**
     * Revert the latest editing status transition for an order detail.
     */
    public function revert(RevertEditingStatusRequest $request, OrderDetail $orderDetail, RevertEditingStatusAction $action): RedirectResponse
    {
        $action->handle($request->toData());

        return back()->with('success', 'Transición revertida');
    }
}
