<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\Unit;
use App\Http\Controllers\Controller;
use App\Http\Resources\StockableResource;
use App\Models\Stockable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        /** @var string search */
        $search = $request->query('search');

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        /** @var string sort_order */
        $sort_order = $request->query('sort_order') ?? 'asc';

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

    public function create(): \Inertia\Response
    {
        return Inertia::render('stock/create');
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min: 4'],
            'quantity' => ['required', 'numeric', 'min:1'],
            'alert_at' => ['required', 'numeric', 'min:1'],
            'unit' => ['required'],
        ]);

        Stockable::create($validated);

        return redirect(route('stockables.index'));
    }

    public function update(Request $request, Stockable $stockable): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min: 4'],
            'quantity' => ['sometimes', 'numeric', 'min:1'],
            'alert_at' => ['sometimes', 'numeric', 'min:1'],
            'unit' => ['sometimes', Rule::in(Unit::cases())],
        ]);

        $stockable->update($validated);

        return redirect(route('stockables.index'));
    }

    public function edit(Stockable $stockable): \Inertia\Response
    {
        return Inertia::render('stock/edit', [
            'stockable' => $stockable,
        ]);
    }

    public function destroy(Stockable $stockable): \Illuminate\Http\RedirectResponse
    {
        DB::transaction(function () use ($stockable) {
            $stockable->productionStatuses()->detach();
            $stockable->delete();
        });

        return redirect(route('stockables.index'));
    }
}
