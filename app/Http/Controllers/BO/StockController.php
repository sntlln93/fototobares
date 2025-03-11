<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockableResource;
use App\Models\Product;
use App\Models\Stockable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $stockables = Stockable::with('products')
            ->when($request->query('search'), function ($q) use ($search) {
                return $q->where('name', 'like', "%$search%")
                    ->orWhere('unit', 'like', "%$search%")
                    ->orWhere('id', $search);
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(10);

        return Inertia::render('stock/index', [
            'stockables' => StockableResource::collection($stockables),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('stock/create', [
            'products' => Product::all(),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min: 4'],
            'quantity' => ['required', 'numeric', 'min:1'],
            'alert_at' => ['required', 'numeric', 'min:1'],
            'unit' => ['required'],
        ]);

        $related_products = $request->validate([
            'products' => ['required', 'sometimes'],
            'products.*' => ['exists:products,id'],
        ]);

        Stockable::create($validated)
            ->products()
            ->sync($related_products['products']);

        return redirect(route('stockables.index'));
    }

    public function update(Request $request, Stockable $stockable): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min: 4'],
            'quantity' => ['sometimes', 'numeric', 'min:1'],
            'alert_at' => ['sometimes', 'numeric', 'min:1'],
        ]);

        $related_products = $request->validate([
            'products' => ['required', 'sometimes'],
            'products.*' => ['exists:products,id'],
        ]);

        DB::transaction(function () use (
            $related_products,
            $validated,
            $stockable,
        ) {
            $stockable->update($validated);

            if (isset($related_products['products'])) {
                $stockable->products()->sync($related_products['products']);
            }
        });

        return redirect(route('stockables.index'));
    }

    public function edit(Stockable $stockable): \Inertia\Response
    {
        return Inertia::render('stock/edit', [
            'products' => Product::all(),
            'stockable' => $stockable->load('products'),
        ]);
    }

    public function destroy(Stockable $stockable): \Illuminate\Http\RedirectResponse
    {
        DB::transaction(function () use ($stockable) {
            $stockable->products()->detach();
            $stockable->delete();
        });

        return redirect(route('stockables.index'));
    }
}
