<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\EditingStatus\ChangeEditingStatusAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\ChangeEditingStatusRequest;
use Illuminate\Http\RedirectResponse;

class EditingStatusController extends Controller
{
    /**
     * Append a new editing status entry for an order detail.
     */
    public function store(ChangeEditingStatusRequest $request, ChangeEditingStatusAction $action): RedirectResponse
    {
        $action->handle($request->toData());

        return back()->with('success', 'Estado de edición actualizado');
    }
}
