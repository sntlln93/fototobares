<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Actions\Tracking\MoveDetailsToStage;
use App\Contracts\ActionContract;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductionStatus;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class SetDetailProductionStatus implements ActionContract
{
    public function __construct(private MoveDetailsToStage $moveDetailsToStage) {}

    /**
     * Change a detail's production status from the order page. Production is
     * gated by the first installment: until it is paid nothing gets enabled.
     * A null status enables the detail as "sin empezar" (it enters /tracking);
     * a stage delegates to the tracking flow, which deducts stock.
     *
     * @param  array<string, mixed>  $params  {order: Order, detail_id: int, status_id: ?int, user: ?User}
     *
     * @throws ValidationException
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var int $detailId */
        $detailId = $params['detail_id'];

        /** @var int|null $statusId */
        $statusId = $params['status_id'];

        /** @var User|null $user */
        $user = $params['user'];

        if ($order->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'order' => 'No se puede fabricar un producto de un pedido cancelado.',
            ]);
        }

        $detail = $order->details()
            ->whereNull('recycled_to')
            ->whereNull('delivered_at')
            ->find($detailId);

        if ($detail === null) {
            throw ValidationException::withMessages([
                'detail_id' => 'No se encontró el producto en este pedido.',
            ]);
        }

        if (! $order->firstInstallmentPaid()) {
            throw ValidationException::withMessages([
                'order' => 'La fabricación se habilita cuando la primera cuota está paga.',
            ]);
        }

        if ($statusId === null) {
            $this->markPending($detail);

            return;
        }

        /** @var ProductionStatus $status */
        $status = ProductionStatus::findOrFail($statusId);

        $this->moveDetailsToStage->handle([
            'detail_ids' => [$detail->id],
            'status' => $status,
            'user' => $user,
        ]);
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
}
