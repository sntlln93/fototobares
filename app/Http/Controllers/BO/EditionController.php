<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Enums\EditingStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Note;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class EditionController extends Controller
{
    /**
     * Read-only edition board: one row per photo-editable order detail,
     * grouped by school -> classroom. Editors only see their own assigned
     * rows and a reduced column set; managers (master/administración/
     * oficina) see everything plus per-classroom accessory totals.
     */
    public function index(Request $request): Response
    {
        /** @var User $actor */
        $actor = $request->user();

        $isManager = $actor->hasAnyRole(UserRole::Master, UserRole::Admin, UserRole::Office);

        $details = OrderDetail::query()
            ->whereHas('product', fn ($query) => $query->where('has_photo', true))
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->whereHas('order', fn ($query) => $query->whereNull('cancelled_at'))
            ->when(! $isManager, function ($query) use ($actor) {
                $query->whereHas('editorAssignment', fn ($assignment) => $assignment->where('editor_id', $actor->id));
            })
            ->with([
                'product.type',
                'order.classroom.school',
                'order.notes',
                'editorAssignment.editor',
                'editingStatusChanges',
            ])
            ->get();

        $orderIds = $details->pluck('order_id')->unique();

        /** @var Collection<int|string, Collection<int, OrderDetail>> $activeDetailsByOrder */
        $activeDetailsByOrder = OrderDetail::query()
            ->whereIn('order_id', $orderIds)
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->with('product.type')
            ->get()
            ->groupBy('order_id');

        $schools = $this->groupBySchool($details, $activeDetailsByOrder, $isManager, $actor);

        return Inertia::render('edition/index', [
            'schools' => $schools,
            'canManage' => $isManager,
            'editors' => $isManager ? User::assignableEditors()->get(['id', 'name']) : [],
            'photoProducts' => $isManager ? Product::where('has_photo', true)->get(['id', 'name']) : [],
        ]);
    }

    /**
     * @param  Collection<int, OrderDetail>  $details
     * @param  Collection<int|string, Collection<int, OrderDetail>>  $activeDetailsByOrder
     * @return array<int, array<string, mixed>>
     */
    private function groupBySchool(Collection $details, Collection $activeDetailsByOrder, bool $isManager, User $actor): array
    {
        return $details
            ->groupBy(function (OrderDetail $detail) {
                /** @var Order $order */
                $order = $detail->order;

                /** @var Classroom $classroom */
                $classroom = $order->classroom;

                return $classroom->school_id;
            })
            ->map(function (Collection $schoolDetails) use ($activeDetailsByOrder, $isManager, $actor) {
                /** @var OrderDetail $firstDetail */
                $firstDetail = $schoolDetails->first();

                /** @var Order $order */
                $order = $firstDetail->order;

                /** @var Classroom $classroom */
                $classroom = $order->classroom;

                /** @var School $school */
                $school = $classroom->school;

                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'classrooms' => $this->groupByClassroom($schoolDetails, $activeDetailsByOrder, $isManager, $actor),
                ];
            })
            ->sortBy('name')
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, OrderDetail>  $schoolDetails
     * @param  Collection<int|string, Collection<int, OrderDetail>>  $activeDetailsByOrder
     * @return array<int, array<string, mixed>>
     */
    private function groupByClassroom(Collection $schoolDetails, Collection $activeDetailsByOrder, bool $isManager, User $actor): array
    {
        return $schoolDetails
            ->groupBy(function (OrderDetail $detail) {
                /** @var Order $order */
                $order = $detail->order;

                return $order->classroom_id;
            })
            ->map(function (Collection $classroomDetails) use ($activeDetailsByOrder, $isManager, $actor) {
                /** @var OrderDetail $firstDetail */
                $firstDetail = $classroomDetails->first();

                /** @var Order $firstOrder */
                $firstOrder = $firstDetail->order;

                /** @var Classroom $classroom */
                $classroom = $firstOrder->classroom;

                $sortedRows = $classroomDetails->sortBy([['order_id', 'asc'], ['id', 'asc']])->values();
                $firstRowIds = $sortedRows->unique('order_id')->pluck('id')->all();

                $rows = $sortedRows
                    ->map(fn (OrderDetail $detail) => $this->mapRow(
                        $detail,
                        in_array($detail->id, $firstRowIds, true),
                        $activeDetailsByOrder->get($detail->order_id) ?? collect(),
                        $isManager,
                        $actor,
                    ))
                    ->values()
                    ->all();

                $classroomGroup = [
                    'id' => $classroom->id,
                    'name' => $classroom->name,
                    'rows' => $rows,
                ];

                if ($isManager) {
                    /** @var Collection<int, int> $orderIds */
                    $orderIds = $sortedRows->pluck('order_id')->unique()->values();

                    $classroomGroup['totals'] = $this->accessoryTotals($orderIds, $activeDetailsByOrder);
                }

                return $classroomGroup;
            })
            ->sortBy('name')
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, OrderDetail>  $orderActiveDetails
     * @return array<string, mixed>
     */
    private function mapRow(OrderDetail $detail, bool $isFirstOfOrder, Collection $orderActiveDetails, bool $isManager, User $actor): array
    {
        /** @var Order $order */
        $order = $detail->order;

        $current = $detail->currentEditingStatus();
        $isAssignedEditor = $detail->editorAssignment?->editor_id === $actor->id;
        $productionEnabled = $detail->production_enabled_at !== null;

        $allowedTargets = EditingStatus::allowedTargets($current, $isManager, $isAssignedEditor, $productionEnabled);

        $row = [
            'id' => $detail->id,
            'order_id' => $detail->order_id,
            'photo_size' => $detail->product?->name,
            'diseno' => $this->variantLabel($detail->variant, 'Tipo de foto'),
            'child_name' => $order->child_name,
            'editing_status' => $current->value,
            'note' => $detail->note,
            'allowed_targets' => array_map(fn (EditingStatus $status) => $status->value, $allowedTargets),
            'is_first_of_order' => $isFirstOfOrder,
        ];

        if ($isManager) {
            $editor = $detail->editorAssignment?->editor;
            $row['editor'] = $editor !== null ? ['id' => $editor->id, 'name' => $editor->name] : null;
        }

        if ($isFirstOfOrder) {
            $mural = $orderActiveDetails->first(fn (OrderDetail $d) => $d->product?->type?->name === 'mural');
            $banda = $orderActiveDetails->first(fn (OrderDetail $d) => $d->product?->type?->name === 'banda');

            $row['modelo_cuadro'] = $mural?->product?->name;
            $row['color'] = $mural !== null ? $this->variantLabel($mural->variant, 'Color') : null;
            // Not one of the "accessory columns" (carpeta/banda/medalla/taza
            // presence flags): visible to every role, unlike $isManager below.
            $row['banda_talle'] = $banda !== null ? $this->variantLabel($banda->variant, 'Talle') : null;
            $row['observaciones_generales'] = $order->notes->map(fn (Note $note) => [
                'id' => $note->id,
                'body' => $note->body,
                'created_at' => $note->created_at->format('d/m/Y H:i'),
            ])->values()->all();

            if ($isManager) {
                $row['accessories'] = [
                    'carpeta' => $orderActiveDetails->contains(fn (OrderDetail $d) => $d->product?->type?->name === 'carpeta'),
                    'banda' => $banda !== null,
                    'medalla' => $orderActiveDetails->contains(fn (OrderDetail $d) => $d->product?->type?->name === 'medalla'),
                    'taza' => $orderActiveDetails->contains(fn (OrderDetail $d) => $d->product?->type?->name === 'taza'),
                    // Not in the product catalog yet (#177): rendered inert.
                    'guantes' => false,
                    'escarapela' => false,
                ];
            }
        }

        return $row;
    }

    /**
     * Accessory presence counted once per order (not per row), per the
     * classroom totals footer.
     *
     * @param  Collection<int, int>  $orderIds
     * @param  Collection<int|string, Collection<int, OrderDetail>>  $activeDetailsByOrder
     * @return array<string, int>
     */
    private function accessoryTotals(Collection $orderIds, Collection $activeDetailsByOrder): array
    {
        $totals = ['carpeta' => 0, 'banda' => 0, 'medalla' => 0, 'taza' => 0, 'guantes' => 0, 'escarapela' => 0];

        foreach ($orderIds as $orderId) {
            $orderDetails = $activeDetailsByOrder->get($orderId) ?? collect();

            foreach (['carpeta', 'banda', 'medalla', 'taza'] as $type) {
                if ($orderDetails->contains(fn (OrderDetail $d) => $d->product?->type?->name === $type)) {
                    $totals[$type]++;
                }
            }
        }

        return $totals;
    }

    /**
     * Looks up a variant snapshot entry by its label, e.g. "Tipo de foto",
     * "Color" or "Talle".
     *
     * @param  array<int, array{label: string, type?: string, value: array{label: string, color?: string}|null}>|null  $variant
     */
    private function variantLabel(?array $variant, string $label): ?string
    {
        foreach ($variant ?? [] as $entry) {
            if ($entry['label'] === $label) {
                return $entry['value']['label'] ?? null;
            }
        }

        return null;
    }
}
