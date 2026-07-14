<?php

declare(strict_types=1);

namespace App\Actions\Tracking;

use App\Contracts\ActionContract;
use App\Models\OrderDetail;
use App\Models\ProductionStatus;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MoveDetailsToStage implements ActionContract
{
    public function __construct(private StockService $stockService) {}

    /**
     * Move the given details to a production stage, deducting stock for every
     * stage reached. Rejects the batch if any detail's product does not own the
     * stage.
     *
     * @param  array<string, mixed>  $params  {detail_ids: array<int, int>, status: ProductionStatus, user: ?User}
     * @return int the number of details updated
     *
     * @throws ValidationException
     */
    public function handle(array $params): int
    {
        /** @var array<int, int> $detailIds */
        $detailIds = $params['detail_ids'];

        /** @var ProductionStatus $status */
        $status = $params['status'];

        /** @var User|null $user */
        $user = $params['user'];

        $details = OrderDetail::with('product', 'productionStatus')
            ->whereIn('id', $detailIds)
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

                $this->stockService->deductForDetail($detail, $user);
            }
        });

        return $details->count();
    }
}
