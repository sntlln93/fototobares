<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateDetailVariant implements ActionContract
{
    public function __construct(private readonly SnapshotDetailVariant $snapshotDetailVariant) {}

    /**
     * Sets an order detail's variant snapshot from a client selection,
     * rebuilding it from the product's own definitions — never trusting
     * client-sent labels/hexes for the option.
     *
     * @param  array<string, mixed>  $params  {order: Order, detail_id: int, variant: array<string, string|null>}
     *
     * @throws ValidationException
     */
    public function handle(array $params): void
    {
        /** @var Order $order */
        $order = $params['order'];

        /** @var int $detailId */
        $detailId = $params['detail_id'];

        /** @var array<string, string|null> $selection */
        $selection = $params['variant'];

        DB::transaction(function () use ($order, $detailId, $selection) {
            $detail = $order->details()->with('product')->find($detailId);

            if ($detail === null) {
                throw ValidationException::withMessages([
                    'detail_id' => 'No se encontró el producto en este pedido.',
                ]);
            }

            $detail->variant = $this->snapshotDetailVariant->handle([
                'definitions' => $detail->product->variants ?? [],
                'selection' => $selection,
            ]);
            $detail->save();
        });
    }
}
