<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreProductionStatusStockableRequest;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use Illuminate\Http\RedirectResponse;

class ProductionStatusStockableController extends Controller
{
    /**
     * Attach a stockable to the stage (or update its quantity).
     */
    public function store(StoreProductionStatusStockableRequest $request, ProductionStatus $productionStatus): RedirectResponse
    {
        $productionStatus->stockables()->syncWithoutDetaching([
            $request->integer('stockable_id') => ['quantity' => $request->delta()],
        ]);

        return back()->with('success', 'Movimiento de insumo guardado');
    }

    public function destroy(ProductionStatus $productionStatus, Stockable $stockable): RedirectResponse
    {
        $productionStatus->stockables()->detach($stockable->id);

        return back()->with('success', 'Movimiento de insumo quitado');
    }
}
