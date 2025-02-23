<?php

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('products/index', ['products' => ProductResource::collection(Product::paginate(10))]);
    }

    public function create()
    {
        return Inertia::render('products/create');
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        Product::create($validated);

        return redirect()->route('products.index');
    }

    public function edit(Product $product)
    {
        return Inertia::render('products/edit', ['product' => $product]);
    }

    public function update(StoreProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        $product->update($validated);

        return redirect()->route('products.index');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index');
    }
}
