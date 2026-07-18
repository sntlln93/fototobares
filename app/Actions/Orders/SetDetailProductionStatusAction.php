<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Actions\Tracking\MoveDetailsToStageAction;
use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\DetailProductionStatusSettingData;
use App\Data\Tracking\DetailStageMovementData;
use App\Models\OrderDetail;
use App\Models\ProductionStatus;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<DetailProductionStatusSettingData>
 */
class SetDetailProductionStatusAction implements ActionContract
{
    public function __construct(private MoveDetailsToStageAction $moveDetailsToStage) {}

    /**
     * Change a detail's production status from the order page. Production is
     * gated by the first installment: until it is paid nothing gets enabled.
     * A null status enables the detail as "sin empezar" (it enters /tracking);
     * a stage delegates to the tracking flow, which deducts stock. Disabling
     * clears production_enabled_at only, removing the detail from /tracking
     * without touching its stage or stock.
     *
     * @param  DetailProductionStatusSettingData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede fabricar un producto de un pedido cancelado.',
            ]);
        }

        $detail = $order->details()
            ->whereNull('recycled_to')
            ->whereNull('delivered_at')
            ->find($params->detailId);

        if ($detail === null) {
            throw ValidationException::withMessages([
                'detail_id' => 'No se encontró el producto en este pedido.',
            ]);
        }

        if ($params->disableProduction) {
            $this->markDisabled($detail);

            return;
        }

        if (! $order->firstInstallmentPaid()) {
            throw ValidationException::withMessages([
                'order' => 'La fabricación se habilita cuando la primera cuota está paga.',
            ]);
        }

        if ($params->statusId === null) {
            $this->markPending($detail);

            return;
        }

        $status = ProductionStatus::findOrFail($params->statusId);

        $this->moveDetailsToStage->handle(new DetailStageMovementData(
            detailIds: [$detail->id],
            status: $status,
            user: $params->user,
        ));
    }

    /**
     * Enable the detail with no stage yet: it shows up in /tracking as
     * "sin empezar". Already-deducted stock stays deducted, mirroring
     * backward moves on the tracking board.
     */
    private function markPending(OrderDetail $detail): void
    {
        $detail->production_enabled_at ??= now();
        $detail->production_status_id = null;
        $detail->status_updated_at = now();
        $detail->save();
    }

    /**
     * Disable the detail: it leaves /tracking, but its reached stage is
     * preserved so re-enabling resumes from it. No stock movement happens.
     */
    private function markDisabled(OrderDetail $detail): void
    {
        $detail->production_enabled_at = null;
        $detail->status_updated_at = now();
        $detail->save();
    }
}
