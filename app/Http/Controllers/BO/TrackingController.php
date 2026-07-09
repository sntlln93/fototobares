<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use App\Models\ProductionStatus;
use App\Models\ProductType;
use App\Models\School;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TrackingController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        /** @var string|null $search */
        $search = $request->query('search');

        /** @var string|null $school_id */
        $school_id = $request->query('school_id');

        /** @var string|null $product_type_id */
        $product_type_id = $request->query('product_type_id');

        /** @var string|null $production_status_id */
        $production_status_id = $request->query('production_status_id');

        $details = OrderDetail::query()
            ->with('product.type', 'productionStatus', 'order.client', 'order.classroom.school')
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->whereHas('order', function ($query) use ($school_id, $search) {
                $query->whereNull('cancelled_at');

                if (! empty($school_id)) {
                    $query->whereHas('classroom', fn ($q) => $q->where('school_id', $school_id));
                }

                if (! empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('child_name', 'like', "%$search%")
                            ->orWhere('id', 'like', "%$search%")
                            ->orWhereHas('client', fn ($c) => $c->where('name', 'like', "%$search%"));
                    });
                }
            })
            ->when(! empty($product_type_id), function ($query) use ($product_type_id) {
                return $query->whereHas('product', fn ($q) => $q->where('product_type_id', $product_type_id));
            })
            ->when(! empty($production_status_id), function ($query) use ($production_status_id) {
                if ($production_status_id === 'none') {
                    return $query->whereNull('production_status_id');
                }

                return $query->where('production_status_id', $production_status_id);
            })
            ->orderByDesc('priority')
            ->orderBy('order_id')
            ->orderBy('id')
            ->limit(500)
            ->get();

        $productTypes = ProductType::with('productionStatuses')->get();

        $schools = School::query()->whereHas('classrooms')->get();

        return Inertia::render('tracking/index', [
            'details' => $details->map(function (OrderDetail $detail) {
                /** @var \App\Models\Order $order */
                $order = $detail->order;

                return [
                    'id' => $detail->id,
                    'order_id' => $detail->order_id,
                    'child_name' => $order->child_name,
                    'client_name' => $order->client?->name,
                    'school' => $order->classroom?->school?->name,
                    'classroom' => $order->classroom?->name,
                    'photo_number' => $order->photo_number,
                    'attended_photo_session' => $order->attended_photo_session,
                    'product_id' => $detail->product_id,
                    'product_name' => $detail->product?->name,
                    'product_type_id' => $detail->product?->product_type_id,
                    'product_type' => $detail->product?->type?->name,
                    'variant' => $detail->variant,
                    'note' => $detail->note,
                    'production_status_id' => $detail->production_status_id,
                    'production_status' => $detail->productionStatus?->name,
                    'position' => $detail->productionStatus->position ?? 0,
                    'priority' => $detail->priority,
                    'status_updated_at' => $detail->status_updated_at?->diffForHumans(),
                ];
            }),
            'productTypes' => $productTypes->map(fn (ProductType $type) => [
                'id' => $type->id,
                'name' => $type->name,
                'statuses' => $type->productionStatuses->map(fn (ProductionStatus $status) => [
                    'id' => $status->id,
                    'name' => $status->name,
                    'position' => $status->position,
                ]),
            ]),
            'schools' => $schools->map(fn (School $school) => [
                'id' => $school->id,
                'name' => $school->name,
            ]),
            'filters' => [
                'search' => $search,
                'school_id' => $school_id,
                'product_type_id' => $product_type_id,
                'production_status_id' => $production_status_id,
            ],
        ]);
    }

    public function batchUpdate(Request $request, StockService $stockService): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'detail_ids' => ['required', 'array', 'min:1'],
            'detail_ids.*' => ['required', 'integer', 'exists:order_details,id'],
            'production_status_id' => ['required', 'integer', 'exists:production_statuses,id'],
        ]);

        /** @var ProductionStatus $status */
        $status = ProductionStatus::findOrFail($validated['production_status_id']);

        $details = OrderDetail::with('product', 'productionStatus')
            ->whereIn('id', $validated['detail_ids'])
            ->get();

        $mismatched = $details->first(
            fn (OrderDetail $detail) => $detail->product?->product_type_id !== $status->product_type_id
        );

        if ($mismatched !== null) {
            return back()->withErrors([
                'detail_ids' => 'Todos los productos seleccionados deben ser del mismo tipo que el estado elegido.',
            ]);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        DB::transaction(function () use ($details, $status, $user, $stockService) {
            foreach ($details as $detail) {
                $previousPosition = $detail->productionStatus->position ?? 0;

                $detail->production_status_id = $status->id;
                $detail->status_updated_at = now();

                if ($status->position < $previousPosition) {
                    $detail->priority = true;
                }

                $detail->save();

                if ($status->position >= 2) {
                    $stockService->deductForDetail($detail, $user);
                }
            }
        });

        $count = $details->count();

        return back()->with('success', "$count producto(s) actualizados a \"{$status->name}\"");
    }
}
