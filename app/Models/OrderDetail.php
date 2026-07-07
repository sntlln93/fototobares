<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class OrderDetail extends Pivot
{
    /** @use HasFactory<\Database\Factories\OrderDetailFactory> */
    use HasFactory;

    public $incrementing = true;

    protected $table = 'order_details';

    protected $casts = [
        'variant' => 'array',
        'priority' => 'boolean',
        'status_updated_at' => 'datetime',
        'stock_deducted_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Order, $this>
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Product, $this>
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<ProductionStatus, $this>
     */
    public function productionStatus()
    {
        return $this->belongsTo(ProductionStatus::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<StockMovement, $this>
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
