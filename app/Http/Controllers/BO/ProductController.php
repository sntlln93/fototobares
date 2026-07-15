<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Products\CreateProductAction;
use App\Actions\Products\DeleteProductAction;
use App\Data\Products\ProductDeletionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\RedirectResponse;
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

    public function store(StoreProductRequest $request, CreateProductAction $action): RedirectResponse
    {
        $action->handle($request->toData());

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
        $data = $request->toData();

        $product->update([
            'name' => $data->name,
            'unit_price' => $data->unitPrice,
            'max_payments' => $data->maxPayments,
            'product_type_id' => $data->productTypeId,
            'variants' => $data->variants,
        ]);

        return redirect()->route('products.index');
    }

    public function destroy(Product $product, DeleteProductAction $action): RedirectResponse
    {
        $action->handle(new ProductDeletionData($product));

        return redirect()->route('products.index');
    }
}
