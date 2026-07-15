<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\DetailVariantSnapshotData;
use App\Data\Orders\DetailVariantUpdateData;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<DetailVariantUpdateData>
 */
class UpdateDetailVariantAction implements ActionContract
{
    public function __construct(private readonly SnapshotDetailVariantAction $snapshotDetailVariant) {}

    /**
     * Sets an order detail's variant snapshot from a client selection,
     * rebuilding it from the product's own definitions — never trusting
     * client-sent labels/hexes for the option.
     *
     * @param  DetailVariantUpdateData  $params
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): void
    {
        $order = $params->order;
        $detailId = $params->detailId;
        $selection = $params->variant;

        DB::transaction(function () use ($order, $detailId, $selection) {
            $detail = $order->details()->with('product')->find($detailId);

            if ($detail === null) {
                throw ValidationException::withMessages([
                    'detail_id' => 'No se encontró el producto en este pedido.',
                ]);
            }

            $detail->variant = $this->snapshotDetailVariant->handle(new DetailVariantSnapshotData(
                definitions: $detail->product->variants ?? [],
                selection: $selection,
            ));
            $detail->save();
        });
    }
}
