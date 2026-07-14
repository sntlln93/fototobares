<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\CancelOrder;
use App\Actions\Orders\CreateOrder;
use App\Actions\Orders\UpdateOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\CancelOrderRequest;
use App\Http\Requests\BO\StoreOrderRequest;
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

        /** @var string sort_by */
        $sort_by = $request->query('sort_by') ?? 'id';

        /** @var 'asc'|'desc' sort_order */
        $sort_order = $request->query('sort_order') ?? 'asc';

        $school_id = $request->filled('school_id') ? $request->integer('school_id') : null;
        $classroom_id = $request->filled('classroom_id') ? $request->integer('classroom_id') : null;

        $schools = School::query()
            ->with(['classrooms'])
            ->whereHas('classrooms')
            ->get();

        $orders = Order::with('client', 'products.type', 'classroom.school')
            ->search($search)
            ->forSchool($school_id)
            ->forClassroom($classroom_id)
            ->orderBy($sort_by, $sort_order)
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

    public function store(StoreOrderRequest $request, CreateOrder $action): RedirectResponse
    {
        /** @var string $redirect_to */
        $redirect_to = request()->query('redirectTo', route('orders.index'));

        $action->handle($request->validated());

        return redirect($redirect_to);
    }

    public function show(Order $order): Response
    {
        $order->load('client', 'products.type', 'payments', 'notes', 'classroom.school', 'details.productionStatus');

        return Inertia::render('orders/show', [
            'order' => new OrderResource($order),
        ]);
    }

    public function edit(Order $order): Response|RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        // Calculate if can edit: allow edit if no payments or first payment not complete
        $canEdit = true;
        if ($order->payments()->count() > 0) {
            $totalPaid = $order->payments()->sum('amount');
            $firstQuote = $order->total_price / $order->payment_plan;
            if ($totalPaid >= $firstQuote) {
                $canEdit = false;
            }
        }

        if (! $canEdit) {
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

    public function update(StoreOrderRequest $request, Order $order, UpdateOrder $action): RedirectResponse
    {
        if ($order->cancelled_at !== null) {
            return back()->withErrors(['order' => 'No se puede editar un pedido cancelado.']);
        }

        // Allow edit only while no payment covers the first installment
        $canEdit = true;
        if ($order->payments()->count() > 0) {
            $totalPaid = $order->payments()->sum('amount');
            $firstQuote = $order->total_price / $order->payment_plan;
            if ($totalPaid >= $firstQuote) {
                $canEdit = false;
            }
        }

        if (! $canEdit) {
            return back()->withErrors(['order' => 'No se puede editar este pedido. La primera cuota ha sido pagada completamente.']);
        }

        $action->handle(['order' => $order, 'data' => $request->validated()]);

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
    public function cancel(CancelOrderRequest $request, Order $order, CancelOrder $action): RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $action->handle(['order' => $order, 'data' => $request->validated(), 'user' => $user]);

        return redirect()->route('orders.show', ['order' => $order->id])
            ->with('success', 'Pedido cancelado');
    }
}
