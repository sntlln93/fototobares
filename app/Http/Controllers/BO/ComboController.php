<?php

namespace App\Http\Controllers\Bo;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComboResource;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Http\Request;

class ComboController extends Controller
{
    public function index()
    {
        $combos = Combo::with('products')->paginate(10);

        return inertia('products/combos/index', [
            'combos' => ComboResource::collection($combos),
        ]);
    }

    public function create()
    {
        $products = Product::all();

        return inertia('products/combos/create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'suggested_price' => 'required',
            'suggested_max_payments' => 'required',
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        $combo = Combo::create($request->only('name', 'suggested_price', 'suggested_max_payments'));

        $combo->products()->attach(
            collect($request->products)->mapWithKeys(function ($product) {
                return [$product['id'] => [
                    'quantity' => $product['quantity'],
                    'variants' => isset($product['variants']) ? json_encode($product['variants']) : null,
                ]];
            })
        );

        return redirect()->route('combos.index');
    }

    public function edit(Combo $combo)
    {
        return inertia('products/combos/edit', ['combo' => new ComboResource($combo)]);
    }

    public function update(Request $request, Combo $combo)
    {
        $request->validate([
            'name' => 'required',
            'suggested_price' => 'required',
            'suggested_max_payments' => 'required',
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        $combo->update($request->only('name', 'suggested_price', 'suggested_max_payments'));

        $combo->products()->sync(
            collect($request->products)->mapWithKeys(function ($product) {
                return [$product['id'] => [
                    'quantity' => $product['quantity'],
                    'variants' => isset($product['variants']) ? json_encode($product['variants']) : null,
                ]];
            })
        );

        return redirect()->route('combos.index');
    }

    public function destroy(Combo $combo)
    {
        $combo->delete();

        return redirect()->route('combos.index');
    }
}
