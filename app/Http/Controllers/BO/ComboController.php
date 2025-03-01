<?php

namespace App\Http\Controllers\Bo;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComboResource;
use App\Http\Resources\EditableComboResource;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Http\Request;

class ComboController extends Controller
{
    public function index()
    {
        $combos = Combo::with('products')->paginate(10);

        return inertia('combos/index', [
            'combos' => ComboResource::collection($combos),
        ]);
    }

    public function create()
    {
        $products = Product::all();

        return inertia('combos/create', [
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
        $products = Product::all();

        return inertia('combos/edit', [
            'products' => $products,
            'combo' => new EditableComboResource($combo->load('products')),
        ]);
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
