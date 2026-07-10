<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Products\CreateProduct;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'products' => ProductResource::collection(Product::paginate(20)),
        ]);
    }

    public function create(): Response
    {
        $types = ProductType::orderBy('name')->get();

        return Inertia::render('products/create', ['product_types' => $types]);
    }

    public function store(StoreProductRequest $request, CreateProduct $action): RedirectResponse
    {
        $action->handle($request->validated());

        return redirect()->route('products.index');
    }

    public function edit(Product $product): Response
    {
        $types = ProductType::orderBy('name')->get();

        return Inertia::render('products/edit', [
            'product' => $product,
            'product_types' => $types,
        ]);
    }

    public function update(StoreProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $product->update($validated);

        return redirect()->route('products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        DB::transaction(function () use ($product) {
            $product->combos()->detach();
            $product->delete();
        });

        return redirect()->route('products.index');
    }
}
