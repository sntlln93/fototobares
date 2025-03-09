<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreOrderRequest;
use App\Models\Client;
use App\Models\Combo;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\School;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('orders/index');
    }

    public function create()
    {
        $schools = School::query()
            ->with(['classrooms.teacher', 'principal'])
            ->whereHas('classrooms')
            ->get();

        $combos = Combo::with(['products'])->get();
        $products = Product::get();

        $schoolLevels = [
            'Todos',
            ...$schools->map(fn ($school) => $school->level)->sort(function ($level1, $level2) {
                return strcmp($level1, $level2);
            })->unique(),
        ];

        return Inertia::render('orders/create', [
            'schoolLevels' => $schoolLevels,
            'schools' => $schools,
            'combos' => $combos,
            'products' => $products,
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $client = Client::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
            ]);

            $order = Order::create([
                'client_id' => $client->id,
                'classroom_id' => $validated['classroom_id'],
                'total_price' => $validated['total_price'],
                'payments' => $validated['payments'],
                'due_date' => $validated['due_date'],
            ]);

            foreach ($validated['order_details'] as $product) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $product['product_id'],
                    'variant' => json_encode($product['variant'] ?? []),
                    'note' => $product['note'],
                ]);
            }
        });

        return redirect()->route('orders.index');
    }
}
