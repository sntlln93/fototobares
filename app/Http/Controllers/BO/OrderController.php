<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Client;
use App\Models\Combo;
use App\Models\Order;
use App\Models\Product;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        /** @var 'id' search */
        $search = $request->query('search');

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        /** @var 'asc'|'desc' sort_order */
        $sort_order = $request->query('sort_order') ?? 'asc';

        /** @var int|null $school_id */
        $school_id = $request->query('school_id');

        $schools = School::query()
            ->with(['classrooms'])
            ->whereHas('classrooms')
            ->get();

        $orders = Order::with('client', 'products.type', 'classroom.school')
            ->where('id', 'like', "%$search%")
            ->whereHas('classroom', function ($query) use ($school_id) {
                if (empty($school_id)) {
                    return $query;
                }

                return $query->where('classrooms.school_id', $school_id);
            })
            ->orderBy($sort_by, $sort_order)
            ->paginate(20);

        return Inertia::render('orders/index', [
            'orders' => OrderResource::collection($orders),
            'schools' => $schools,
        ]);
    }

    public function create(): \Inertia\Response
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

    public function store(StoreOrderRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        /** @var string $redirect_to */
        $redirect_to = request()->query('redirectTo', route('orders.index'));

        DB::transaction(function () use ($validated) {
            $client = Client::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
            ]);

            $order = Order::create([
                'client_id' => $client->id,
                'classroom_id' => $validated['classroom_id'],
                'total_price' => $validated['total_price'],
                'payment_plan' => $validated['payment_plan'],
                'due_date' => $validated['due_date'],
            ]);

            foreach ($validated['order_details'] as $product) {
                $order->products()->attach($product['product_id'], [
                    'variant' => json_encode($product['variant'] ?? []),
                    'note' => $product['note'],
                ]);
            }
        });

        return redirect($redirect_to);
    }

    public function show(Order $order): \Inertia\Response
    {
        $order->load('client', 'products.type', 'payments');

        return Inertia::render('orders/show', [
            'order' => new OrderResource($order),
        ]);
    }
}
