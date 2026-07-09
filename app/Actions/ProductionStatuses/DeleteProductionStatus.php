<?php

declare(strict_types=1);

namespace App\Actions\ProductionStatuses;

use App\Models\ProductionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteProductionStatus
{
    /**
     * Delete an unused stage and close the gap it leaves in the chain.
     *
     * @throws ValidationException when the stage is the only one of its
     *                             product, has details currently in it
     *                             or consumes stockables
     */
    public function handle(ProductionStatus $status): void
    {
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
                'status' => 'No se puede eliminar: esta etapa consume insumos. Quitá esa configuración primero.',
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
