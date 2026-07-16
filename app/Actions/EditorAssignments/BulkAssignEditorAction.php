<?php

declare(strict_types=1);

namespace App\Actions\EditorAssignments;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\EditorAssignments\BulkEditorAssignmentData;
use App\Models\EditorOrderDetailAssignment;
use App\Models\OrderDetail;

/**
 * @implements ActionContract<BulkEditorAssignmentData>
 */
class BulkAssignEditorAction implements ActionContract
{
    /**
     * Assign an editor to every in-scope order detail of a school or
     * classroom, for the selected photo products. In scope mirrors the
     * `/tracking` board: production enabled, not delivered, not recycled,
     * order not cancelled.
     *
     * @param  BulkEditorAssignmentData  $params
     */
    public function handle(DtoContract $params): int
    {
        $details = OrderDetail::query()
            ->whereHas('product', fn ($query) => $query->where('has_photo', true)->whereIn('id', $params->productIds))
            ->whereNotNull('production_enabled_at')
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->whereHas('order', function ($query) use ($params) {
                $query->whereNull('cancelled_at');

                if ($params->classroomId !== null) {
                    $query->where('classroom_id', $params->classroomId);
                } else {
                    $query->whereHas('classroom', fn ($q) => $q->where('school_id', $params->schoolId));
                }
            })
            ->get(['id']);

        foreach ($details as $detail) {
            EditorOrderDetailAssignment::updateOrCreate(
                ['order_detail_id' => $detail->id],
                [
                    'editor_id' => $params->editorId,
                    'assigned_by' => $params->assignedBy,
                    'assigned_at' => now(),
                ]
            );
        }

        return $details->count();
    }
}
