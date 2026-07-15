<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Tracking\MoveDetailsToStage;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\BatchUpdateTrackingRequest;
use App\Models\Classroom;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\ProductType;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var string|null $search */
        $search = $request->query('search');

        $school_id = $request->filled('school_id') ? $request->integer('school_id') : null;
        $classroom_id = $request->filled('classroom_id') ? $request->integer('classroom_id') : null;

        /** @var string|null $product_type_id */
        $product_type_id = $request->query('product_type_id');

        /** @var string|null $production_status_id */
        $production_status_id = $request->query('production_status_id');

        $details = OrderDetail::query()
            ->with('product.type', 'productionStatus', 'order.client', 'order.classroom.school')
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            // Production starts with the first paid installment: details not
            // yet enabled from the order page stay out of the workshop board
            ->whereNotNull('production_enabled_at')
            ->whereHas('order', function ($query) use ($school_id, $classroom_id, $search) {
                $query->whereNull('cancelled_at');

                if ($school_id !== null) {
                    $query->whereHas('classroom', fn ($q) => $q->where('school_id', $school_id));
                }

                if ($classroom_id !== null) {
                    $query->where('classroom_id', $classroom_id);
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

        $products = Product::query()
            ->whereIn('id', $details->pluck('product_id')->unique())
            ->with('type', 'productionStatuses')
            ->get();

        $schools = School::query()->with('classrooms')->whereHas('classrooms')->get();

        return Inertia::render('tracking/index', [
            'details' => $details->map(function (OrderDetail $detail) {
                /** @var Order $order */
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
            'products' => $products->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'type' => $product->type?->name,
                'statuses' => $product->productionStatuses->map(fn (ProductionStatus $status) => [
                    'id' => $status->id,
                    'name' => $status->name,
                    'position' => $status->position,
                ]),
            ]),
            'productTypes' => ProductType::query()->get(['id', 'name']),
            'schools' => $schools->map(fn (School $school) => [
                'id' => $school->id,
                'name' => $school->name,
                'classrooms' => $school->classrooms->map(fn (Classroom $classroom) => [
                    'id' => $classroom->id,
                    'name' => $classroom->name,
                    'school_id' => $classroom->school_id,
                ]),
            ]),
            'filters' => [
                'search' => $search,
                'school_id' => $school_id,
                'classroom_id' => $classroom_id,
                'product_type_id' => $product_type_id,
                'production_status_id' => $production_status_id,
            ],
        ]);
    }

    public function batchUpdate(BatchUpdateTrackingRequest $request, MoveDetailsToStage $action): RedirectResponse
    {
        /** @var array{production_status_id: int|string} $validated */
        $validated = $request->validated();

        /** @var ProductionStatus $status */
        $status = ProductionStatus::findOrFail($validated['production_status_id']);

        /** @var User|null $user */
        $user = $request->user();

        $count = $action->handle($request->toData($status, $user));

        return back()->with('success', "$count producto(s) actualizados a \"{$status->name}\"");
    }
}
