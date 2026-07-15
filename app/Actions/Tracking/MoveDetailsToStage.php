<?php

declare(strict_types=1);

namespace App\Actions\Tracking;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Tracking\MoveDetailsToStageData;
use App\Models\OrderDetail;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<MoveDetailsToStageData>
 */
class MoveDetailsToStage implements ActionContract
{
    public function __construct(private StockService $stockService) {}

    /**
     * Move the given details to a production stage, applying the stock deltas
     * hung from every stage reached. Rejects the batch if any detail's product
     * does not own the stage.
     *
     * @param  MoveDetailsToStageData  $params
     * @return int the number of details updated
     *
     * @throws ValidationException
     */
    public function handle(DtoContract $params): int
    {
        $status = $params->status;
        $user = $params->user;

        $details = OrderDetail::with('product', 'productionStatus')
            ->whereIn('id', $params->detailIds)
            ->get();

        $mismatched = $details->first(
            fn (OrderDetail $detail) => $detail->product_id !== $status->product_id
        );

        if ($mismatched !== null) {
            throw ValidationException::withMessages([
                'detail_ids' => 'La etapa elegida no pertenece al producto de todos los seleccionados.',
            ]);
        }

        DB::transaction(function () use ($details, $status, $user) {
            foreach ($details as $detail) {
                $detail->productionStatus()->associate($status);
                // A detail on a stage is by definition enabled for production
                $detail->production_enabled_at ??= now();
                $detail->status_updated_at = now();
                $detail->save();
                $detail->setRelation('productionStatus', $status);

                $this->stockService->applyForDetail($detail, $user);
            }
        });

        return $details->count();
    }
}
