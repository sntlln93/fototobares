<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\CancelOrderAction;
use App\Actions\Orders\CreateOrderAction;
use App\Actions\Orders\UpdateOrderAction;
use App\Actions\Orders\UpdateOrderClientAction;
use App\Data\Orders\OrderUpdateData;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\CancelOrderRequest;
use App\Http\Requests\BO\StoreOrderRequest;
use App\Http\Requests\BO\UpdateOrderClientRequest;
use App\Http\Resources\OrderResource;
use App\Models\Combo;
use App\Models\Order;
use App\Models\OrderDraft;
use App\Models\Product;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var string|null $search */
        $search = $request->query('search');

        $school_id = $request->filled('school_id') ? $request->integer('school_id') : null;
        $classroom_id = $request->filled('classroom_id') ? $request->integer('classroom_id') : null;

        // A classroom-filtered list matches the paper sheet, so it follows
        // the child's order number by default
        /** @var string $sort_by */
        $sort_by = $request->query('sort_by') ?? ($classroom_id !== null ? 'photo_number' : 'id');

        /** @var 'asc'|'desc' $sort_order */
        $sort_order = $request->query('sort_order') ?? 'asc';

        $schools = School::query()
            ->with(['classrooms'])
            ->whereHas('classrooms')
            ->get();

        $orders = Order::with('client', 'products.type', 'classroom.school', 'payments')
            ->search($search)
            ->forSchool($school_id)
            ->forClassroom($classroom_id)
            ->when($sort_by === 'photo_number', fn ($query) => $query->orderByRaw('orders.photo_number is null'))
            ->orderBy($sort_by, $sort_order)
            ->orderBy('orders.id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('orders/index', [
            'orders' => OrderResource::collection($orders),
            'schools' => $schools,
            'filters' => [
                'search' => $search,
                'school_id' => $school_id,
                'classroom_id' => $classroom_id,
            ],
        ]);
    }

    public function create(Request $request): Response
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

        $draft = null;

        if ($request->filled('draft')) {
            $draft = OrderDraft::with('classroom')->find($request->query('draft'));
        }

        return Inertia::render('orders/create', [
            'schoolLevels' => $schoolLevels,
            'schools' => $schools,
            'combos' => $combos,
            'products' => $products,
            'draft' => $draft,
        ]);
    }

    public function store(StoreOrderRequest $request, CreateOrderAction $action): RedirectResponse
    {
        /** @var string $redirect_to */
        $redirect_to = request()->query('redirectTo', route('orders.index'));

        $action->handle($request->toData());

        return redirect($redirect_to);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'client',
            'products.type',
            'products.productionStatuses',
            'payments',
            'notes',
            'classroom.school',
            'details' => fn ($query) => $query->withCount('stockMovements')->with('productionStatus'),
        ]);

        return Inertia::render('orders/show', [
            'order' => new OrderResource($order),
        ]);
    }

    public function edit(Order $order): Response|RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        if ($order->firstInstallmentPaid()) {
            return back()->withErrors(['order' => 'No se puede editar este pedido. La primera cuota ha sido pagada completamente.']);
        }

        $schools = School::query()
            ->with(['classrooms.teacher', 'principal'])
            ->whereHas('classrooms')
            ->get();

        $combos = Combo::with(['products'])->get();
        $products = Product::get();

        return Inertia::render('orders/edit', [
            'order' => $order->load('client', 'products', 'classroom'),
            'schools' => $schools,
            'combos' => $combos,
            'products' => $products,
        ]);
    }

    public function update(StoreOrderRequest $request, Order $order, UpdateOrderAction $action): RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        if ($order->firstInstallmentPaid()) {
            return back()->withErrors(['order' => 'No se puede editar este pedido. La primera cuota ha sido pagada completamente.']);
        }

        $action->handle(new OrderUpdateData($order, $request->toData()));

        return redirect()->route('orders.show', ['order' => $order->id])
            ->with('success', 'Pedido actualizado exitosamente');
    }

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->payments()->exists()) {
            return back()->withErrors(['order' => 'No se puede eliminar un pedido con pagos registrados.']);
        }

        $order->delete();

        return redirect()->route('orders.index')
            ->with('success', 'Pedido eliminado exitosamente');
    }

    /**
     * Cancel an order: each product goes back to stock (its supplies are
     * returned) or to the recycling bin, chosen per product.
     */
    public function cancel(CancelOrderRequest $request, Order $order, CancelOrderAction $action): RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $action->handle($request->toData($order, $user));

        return redirect()->route('orders.show', ['order' => $order->id])
            ->with('success', 'Pedido cancelado');
    }

    public function updateClient(UpdateOrderClientRequest $request, Order $order, UpdateOrderClientAction $action): RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        $action->handle($request->toData($order));

        return back()->with('success', 'Datos del cliente actualizados exitosamente');
    }
}
