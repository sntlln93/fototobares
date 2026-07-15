<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\ProductionStatuses\DeleteProductionStatusData;
use App\Models\ProductionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @implements ActionContract<DeleteProductionStatusData>
 */
class DeleteProductionStatus implements ActionContract
{
    /**
     * Delete an unused stage and close the gap it leaves in the chain.
     *
     * @param  DeleteProductionStatusData  $params
     *
     * @throws ValidationException when the stage is the only one of its
     *                             product, has details currently in it
     *                             or moves stockables
     */
    public function handle(DtoContract $params): void
    {
        $status = $params->status;

        $siblings = ProductionStatus::query()
            ->where('product_id', $status->product_id)
            ->count();

        if ($siblings <= 1) {
            throw ValidationException::withMessages([
                'status' => 'No se puede eliminar la única etapa del producto.',
            ]);
        }

        if ($status->orderDetails()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'No se puede eliminar: hay productos en esta etapa. Renombrala o movelos primero.',
            ]);
        }

        if ($status->stockables()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'No se puede eliminar: esta etapa mueve insumos. Quitá esa configuración primero.',
            ]);
        }

        DB::transaction(function () use ($status) {
            $status->delete();

            $this->compactPositions($status->product_id);
        });
    }

    private function compactPositions(int $productId): void
    {
        $statuses = ProductionStatus::query()
            ->where('product_id', $productId)
            ->orderBy('position')
            ->get();

        foreach ($statuses->values() as $index => $status) {
            if ($status->position !== $index + 1) {
                $status->update(['position' => $index + 1]);
            }
        }
    }
}
