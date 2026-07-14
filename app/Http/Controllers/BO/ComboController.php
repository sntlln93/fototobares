<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Combos\DeleteCombo;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreComboRequest;
use App\Http\Resources\ComboResource;
use App\Http\Resources\EditableComboResource;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ComboController extends Controller
{
    public function index(): Response
    {
        $combos = Combo::with('products')->paginate(20);

        return Inertia::render('combos/index', [
            'combos' => ComboResource::collection($combos),
        ]);
    }

    public function create(): Response
    {
        $products = Product::all();

        return Inertia::render('combos/create', [
            'products' => $products,
        ]);
    }

    public function store(StoreComboRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $combo = Combo::create([
            'name' => $validated['name'],
            'suggested_price' => $validated['suggested_price'],
            'default_payments' => $validated['default_payments'],
        ]);

        $combo->products()->attach($this->pivotData($validated['products']));

        return redirect()->route('combos.index');
    }

    public function edit(Combo $combo): Response
    {
        $products = Product::all();

        return Inertia::render('combos/edit', [
            'products' => $products,
            'combo' => new EditableComboResource($combo->load('products')),
        ]);
    }

    public function update(StoreComboRequest $request, Combo $combo): RedirectResponse
    {
        $validated = $request->validated();

        $combo->update([
            'name' => $validated['name'],
            'suggested_price' => $validated['suggested_price'],
            'default_payments' => $validated['default_payments'],
        ]);

        $combo->products()->sync($this->pivotData($validated['products']));

        return redirect()->route('combos.index');
    }

    public function destroy(Combo $combo, DeleteCombo $action): RedirectResponse
    {
        $action->handle(['combo' => $combo]);

        return redirect()->route('combos.index');
    }

    /**
     * @param  array<int, array{id: int, quantity: int, subtract_value: int, variants?: array<string, mixed>|null}>  $products
     * @return Collection<int, array{quantity: int, subtract_value: int, variants: array<string, mixed>|null}>
     */
    private function pivotData(array $products): Collection
    {
        return (new Collection($products))->mapWithKeys(function (array $product) {
            return [$product['id'] => [
                'quantity' => $product['quantity'],
                'subtract_value' => $product['subtract_value'],
                'variants' => $product['variants'] ?? null,
            ]];
        });
    }
}
