<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\ProductionStatuses\CreateProductionStatus;
use App\Actions\ProductionStatuses\DeleteProductionStatus;
use App\Actions\ProductionStatuses\ReorderProductionStatuses;
use App\Data\ProductionStatuses\DeleteProductionStatusData;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\ReorderProductionStatusesRequest;
use App\Http\Requests\BO\StoreProductionStatusRequest;
use App\Http\Requests\BO\UpdateProductionStatusRequest;
use App\Http\Resources\ProductStagesResource;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductionStatusController extends Controller
{
    public function index(): Response
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

    public function store(StoreProductionStatusRequest $request, CreateProductionStatus $action): RedirectResponse
    {
        $data = $request->toData();

        $action->handle($data);

        return back()->with('success', "Etapa \"{$data->name}\" agregada");
    }

    public function update(UpdateProductionStatusRequest $request, ProductionStatus $productionStatus): RedirectResponse
    {
        $productionStatus->update($request->validated());

        return back()->with('success', 'Etapa renombrada');
    }

    public function destroy(ProductionStatus $productionStatus, DeleteProductionStatus $action): RedirectResponse
    {
        $action->handle(new DeleteProductionStatusData($productionStatus));

        return back()->with('success', "Etapa \"{$productionStatus->name}\" eliminada");
    }

    public function reorder(ReorderProductionStatusesRequest $request, ReorderProductionStatuses $action): RedirectResponse
    {
        $action->handle($request->toData());

        return back()->with('success', 'Orden de etapas actualizado');
    }
}
