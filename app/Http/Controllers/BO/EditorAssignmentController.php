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
        $result = $action->handle($request->toData());

        $response = back()->with('success', "{$result->assigned} producto(s) asignados al editor");

        if ($result->skipped > 0) {
            $response->with('warning', "{$result->skipped} foto(s) ya están editadas y no se pueden reasignar/desasignar");
        }

        return $response;
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
