<?php

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Stockable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $search = $request->query('search');
        $sort_by = $request->query('sort_by') ?? 'id';
        $sort_order = $request->query('sort_order') ?? 'asc';

        $stockables = Stockable::with('products')
            ->when($request->query('search'), function ($q) use ($search) {
                return $q->where('name', '%LIKE%', $search)
                    ->orWhere('unit', '%LIKE%', $search)
                    ->orWhere('id', $search);
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(10);

        return Inertia::render('stock/index', [
            'stockables' => $stockables,
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
            'quantity' => ['required', 'integer', 'min:1'],
            'alert_at' => ['required', 'integer', 'min:1'],
            'unit' => ['required'],
        ]);

        $related_products = $request->validate([
            'products' => ['required', 'sometimes'],
            'products.*' => ['exists:products,id'],
        ]);

        $stockable = Stockable::create($validated);

        $stockable->products()->sync($related_products['products']);

        return redirect(route('stockables.index'));
    }

    public function update(Request $request, Stockable $stockable): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min: 4'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'alert_at' => ['sometimes', 'integer', 'min:1'],
        ]);

        $related_products = $request->validate([
            'products' => ['required', 'sometimes'],
            'products.*' => ['exists:products,id'],
        ]);

        $stockable->update($validated);
        $stockable->products()->sync($related_products['products']);

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
        $stockable->products()->detach();
        $stockable->delete();

        return redirect(route('stockables.index'));
    }
}
