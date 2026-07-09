<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\ProductionStatuses\CreateProductionStatus;
use App\Actions\ProductionStatuses\DeleteProductionStatus;
use App\Actions\ProductionStatuses\ReorderProductionStatuses;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\ReorderProductionStatusesRequest;
use App\Http\Requests\BO\StoreProductionStatusRequest;
use App\Http\Requests\BO\UpdateProductionStatusRequest;
use App\Http\Resources\ProductStagesResource;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use Inertia\Inertia;

class ProductionStatusController extends Controller
{
    public function index(): \Inertia\Response
    {
        $products = Product::query()
            ->with(['type', 'productionStatuses' => fn ($query) => $query
                ->withCount(['orderDetails as details_count'])
                ->with('stockables'),
            ])
            ->orderBy('product_type_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('production-statuses/index', [
            'products' => ProductStagesResource::collection($products)->resolve(),
            'stockables' => Stockable::query()
                ->orderBy('name')
                ->get(['id', 'name', 'unit']),
        ]);
    }

    public function store(StoreProductionStatusRequest $request, CreateProductionStatus $action): \Illuminate\Http\RedirectResponse
    {
        /** @var array{product_id: int, name: string} $validated */
        $validated = $request->validated();

        $action->handle($validated['product_id'], $validated['name']);

        return back()->with('success', "Etapa \"{$validated['name']}\" agregada");
    }

    public function update(UpdateProductionStatusRequest $request, ProductionStatus $productionStatus): \Illuminate\Http\RedirectResponse
    {
        $productionStatus->update($request->validated());

        return back()->with('success', 'Etapa renombrada');
    }

    public function destroy(ProductionStatus $productionStatus, DeleteProductionStatus $action): \Illuminate\Http\RedirectResponse
    {
        $action->handle($productionStatus);

        return back()->with('success', "Etapa \"{$productionStatus->name}\" eliminada");
    }

    public function reorder(ReorderProductionStatusesRequest $request, ReorderProductionStatuses $action): \Illuminate\Http\RedirectResponse
    {
        /** @var array{product_id: int, ordered_ids: array<int, int>} $validated */
        $validated = $request->validated();

        $action->handle($validated['product_id'], $validated['ordered_ids']);

        return back()->with('success', 'Orden de etapas actualizado');
    }
}
