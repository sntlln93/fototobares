<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Combos\DeleteComboAction;
use App\Data\Combos\ComboDeletionData;
use App\Data\Combos\ComboProductData;
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
        $data = $request->toData();

        $combo = Combo::create([
            'name' => $data->name,
            'suggested_price' => $data->suggestedPrice,
            'default_payments' => $data->defaultPayments,
        ]);

        $combo->products()->attach($this->pivotData($data->products));

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
        $data = $request->toData();

        $combo->update([
            'name' => $data->name,
            'suggested_price' => $data->suggestedPrice,
            'default_payments' => $data->defaultPayments,
        ]);

        $combo->products()->sync($this->pivotData($data->products));

        return redirect()->route('combos.index');
    }

    public function destroy(Combo $combo, DeleteComboAction $action): RedirectResponse
    {
        $action->handle(new ComboDeletionData($combo));

        return redirect()->route('combos.index');
    }

    /**
     * @param  list<ComboProductData>  $products
     * @return Collection<int, array{quantity: int, subtract_value: int, variants: array<string, mixed>|null}>
     */
    private function pivotData(array $products): Collection
    {
        return (new Collection($products))->mapWithKeys(function (ComboProductData $product) {
            return [$product->id => [
                'quantity' => $product->quantity,
                'subtract_value' => $product->subtractValue,
                'variants' => $product->variants,
            ]];
        });
    }
}
