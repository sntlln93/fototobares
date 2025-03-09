<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComboResource;
use App\Http\Resources\EditableComboResource;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ComboController extends Controller
{
    public function index(): \Inertia\Response
    {
        $combos = Combo::with('products')->paginate(10);

        return inertia('combos/index', [
            'combos' => ComboResource::collection($combos),
        ]);
    }

    public function create(): \Inertia\Response
    {
        $products = Product::all();

        return inertia('combos/create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name' => ['required'],
            'suggested_price' => ['required', 'numeric', 'min:1'],
            'suggested_max_payments' => ['required', 'numeric', 'min:1'],
            'products' => ['required', 'array'],
            'products.*.id' => ['required', 'exists:products,id'],
            'products.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $combo = Combo::create($request->only([
            'name',
            'suggested_price',
            'suggested_max_payments',
        ]));

        $combo->products()->attach(
            new Collection($request->products)->mapWithKeys(function ($product) {
                return [$product['id'] => [
                    'quantity' => $product['quantity'],
                    'variants' => isset($product['variants']) ? json_encode($product['variants']) : null,
                ]];
            })
        );

        return redirect()->route('combos.index');
    }

    public function edit(Combo $combo): \Inertia\Response
    {
        $products = Product::all();

        return inertia('combos/edit', [
            'products' => $products,
            'combo' => new EditableComboResource($combo->load('products')),
        ]);
    }

    public function update(Request $request, Combo $combo): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'name' => 'required',
            'suggested_price' => ['required', 'numeric', 'min:1'],
            'suggested_max_payments' => ['required', 'numeric', 'min:1'],
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        $combo->update($request->only([
            'name',
            'suggested_price',
            'suggested_max_payments',
        ]));

        $combo->products()->sync(
            new Collection($request->products)->mapWithKeys(function ($product) {
                return [$product['id'] => [
                    'quantity' => $product['quantity'],
                    'variants' => isset($product['variants']) ? json_encode($product['variants']) : null,
                ]];
            })
        );

        return redirect()->route('combos.index');
    }

    public function destroy(Combo $combo): \Illuminate\Http\RedirectResponse
    {
        DB::transaction(function () use ($combo) {
            $combo->products()->detach();
            $combo->delete();
        });

        return redirect()->route('combos.index');
    }
}
