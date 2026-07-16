<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\EditorAssignments\AssignEditorAction;
use App\Actions\EditorAssignments\BulkAssignEditorAction;
use App\Actions\EditorAssignments\UnassignEditorAction;
use App\Data\EditorAssignments\EditorUnassignmentData;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\AssignEditorRequest;
use App\Http\Requests\BO\BulkAssignEditorRequest;
use App\Models\OrderDetail;
use Illuminate\Http\RedirectResponse;

class EditorAssignmentController extends Controller
{
    /**
     * Assign (or reassign) an editor to a single order detail.
     */
    public function store(AssignEditorRequest $request, AssignEditorAction $action): RedirectResponse
    {
        $action->handle($request->toData());

        return back()->with('success', 'Editor asignado');
    }

    /**
     * Assign an editor to every in-scope order detail of a school or
     * classroom, for the selected photo products.
     */
    public function bulkStore(BulkAssignEditorRequest $request, BulkAssignEditorAction $action): RedirectResponse
    {
        $count = $action->handle($request->toData());

        return back()->with('success', "$count producto(s) asignados al editor");
    }

    /**
     * Remove the editor assignment of an order detail.
     */
    public function destroy(OrderDetail $orderDetail, UnassignEditorAction $action): RedirectResponse
    {
        $action->handle(new EditorUnassignmentData(orderDetailId: $orderDetail->id));

        return back()->with('success', 'Editor desasignado');
    }
}
