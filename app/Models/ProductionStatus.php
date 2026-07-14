<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[WithoutTimestamps]
class ProductionStatus extends Model
{
    /**
     * @return BelongsTo<Product, $this>
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Stockables whose stock moves when a detail reaches this stage.
     * Pivot quantity is a signed delta: positive adds stock, negative
     * consumes it.
     *
     * @return BelongsToMany<Stockable, $this>
     */
    public function stockables()
    {
        return $this->belongsToMany(Stockable::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * @return HasMany<OrderDetail, $this>
     */
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
