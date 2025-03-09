<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('products/index', ['products' => ProductResource::collection(Product::paginate(10))]);
    }

    public function create(): \Inertia\Response
    {
        $types = ProductType::orderBy('name')->get();

        return Inertia::render('products/create', ['product_types' => $types]);
    }

    public function store(StoreProductRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        Product::create($validated);

        return redirect()->route('products.index');
    }

    public function edit(Product $product): \Inertia\Response
    {
        $types = ProductType::orderBy('name')->get();

        return Inertia::render('products/edit', [
            'product' => $product,
            'product_types' => $types,
        ]);
    }

    public function update(StoreProductRequest $request, Product $product): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $product->update($validated);

        return redirect()->route('products.index');
    }

    public function destroy(Product $product): \Illuminate\Http\RedirectResponse
    {
        DB::transaction(function () use ($product) {
            $product->combos()->detach();
            $product->stockables()->detach();
            $product->delete();
        });

        return redirect()->route('products.index');
    }
}
