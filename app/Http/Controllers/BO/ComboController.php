<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreComboRequest;
use App\Http\Resources\ComboResource;
use App\Http\Resources\EditableComboResource;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ComboController extends Controller
{
    public function index(): \Inertia\Response
    {
        $combos = Combo::with('products')->paginate(10);

        return Inertia::render('combos/index', [
            'combos' => ComboResource::collection($combos),
        ]);
    }

    public function create(): \Inertia\Response
    {
        $products = Product::all();

        return Inertia::render('combos/create', [
            'products' => $products,
        ]);
    }

    public function store(StoreComboRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $combo = Combo::create([
            'name' => $validated['name'],
            'suggested_price' => $validated['suggested_price'],
            'suggested_max_payments' => $validated['suggested_max_payments'],
        ]);

        $combo->products()->attach(
            new Collection($validated['products'])->mapWithKeys(function ($product) {
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

        return Inertia::render('combos/edit', [
            'products' => $products,
            'combo' => new EditableComboResource($combo->load('products')),
        ]);
    }

    public function update(StoreComboRequest $request, Combo $combo): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        $combo->update([
            'name' => $validated['name'],
            'suggested_price' => $validated['suggested_price'],
            'suggested_max_payments' => $validated['suggested_max_payments'],
        ]);

        $combo->products()->sync(
            new Collection($validated['products'])->mapWithKeys(function ($product) {
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
