<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EditingStatus;
use Database\Factories\OrderDetailFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;

class OrderDetail extends Pivot
{
    /** @use HasFactory<OrderDetailFactory> */
    use HasFactory;

    protected $table = 'order_details';

    public $incrementing = true;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductionStatus, $this>
     */
    public function productionStatus()
    {
        return $this->belongsTo(ProductionStatus::class);
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'order_detail_id');
    }

    /**
     * @return HasMany<OrderEditingStatusChange, $this>
     */
    public function editingStatusChanges()
    {
        return $this->hasMany(OrderEditingStatusChange::class, 'order_detail_id');
    }

    /**
     * @return HasOne<EditorOrderDetailAssignment, $this>
     */
    public function editorAssignment()
    {
        return $this->hasOne(EditorOrderDetailAssignment::class, 'order_detail_id');
    }

    /**
     * Current editing status: the latest entry in the append-only history,
     * or `Pendiente` when the detail has none. Reads the `editingStatusChanges`
     * relation from memory when it has been eager-loaded (avoids an N+1 query
     * per row), falling back to a fresh query otherwise.
     */
    public function currentEditingStatus(): EditingStatus
    {
        if ($this->relationLoaded('editingStatusChanges')) {
            $latest = $this->editingStatusChanges
                ->sortBy([['changed_at', 'desc'], ['id', 'desc']])
                ->first();
        } else {
            $latest = $this->editingStatusChanges()->orderByDesc('changed_at')->orderByDesc('id')->first();
        }

        if ($latest === null) {
            return EditingStatus::Pendiente;
        }

        return $latest->status;
    }

    /**
     * Details still `pendiente`: no rows in the editing status history.
     *
     * @param  Builder<OrderDetail>  $query
     * @return Builder<OrderDetail>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->whereDoesntHave('editingStatusChanges');
    }

    /**
     * Details assignable to an editor: photo product, production enabled,
     * not delivered, not recycled, and belonging to a non-cancelled order.
     *
     * @param  Builder<OrderDetail>  $query
     * @return Builder<OrderDetail>
     */
    public function scopeAssignableToEditor(Builder $query): Builder
    {
        return $query
            ->whereHas('product', fn ($query) => $query->where('has_photo', true))
            ->whereNotNull('production_enabled_at')
            ->whereNull('delivered_at')
            ->whereNull('recycled_to')
            ->whereHas('order', fn ($query) => $query->whereNull('cancelled_at'));
    }

    protected $casts = [
        'variant' => 'array',
        'priority' => 'boolean',
        'production_enabled_at' => 'datetime',
        'status_updated_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];
}
