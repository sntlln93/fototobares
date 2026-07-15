<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Stock\DeleteStockableAction;
use App\Data\Stock\StockableDeletionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreStockableRequest;
use App\Http\Requests\BO\UpdateStockableRequest;
use App\Http\Resources\StockableResource;
use App\Models\Stockable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var string search */
        $search = $request->query('search');

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        $sort_order = $request->query('sort_order') === 'desc' ? 'desc' : 'asc';

        $stockables = Stockable::with('productionStatuses.product')
            ->when($request->query('search'), function ($q) use ($search) {
                return $q->where('name', 'like', "%$search%")
                    ->orWhere('unit', 'like', "%$search%")
                    ->orWhere('id', $search);
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(20);

        return Inertia::render('stock/index', [
            'stockables' => StockableResource::collection($stockables),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('stock/create');
    }

    public function store(StoreStockableRequest $request): RedirectResponse
    {
        Stockable::create($request->validated());

        return redirect(route('stockables.index'));
    }

    public function update(UpdateStockableRequest $request, Stockable $stockable): RedirectResponse
    {
        $stockable->update($request->validated());

        return redirect(route('stockables.index'));
    }

    public function edit(Stockable $stockable): Response
    {
        return Inertia::render('stock/edit', [
            'stockable' => $stockable,
        ]);
    }

    public function destroy(Stockable $stockable, DeleteStockableAction $action): RedirectResponse
    {
        $action->handle(new StockableDeletionData($stockable));

        return redirect(route('stockables.index'));
    }
}
