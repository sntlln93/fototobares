<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\OrderDetailFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        return $this->hasMany(StockMovement::class);
    }

    protected $casts = [
        'variant' => 'array',
        'priority' => 'boolean',
        'status_updated_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];
}
