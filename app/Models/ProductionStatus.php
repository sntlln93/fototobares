<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionStatus extends Model
{
    public $timestamps = false;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Product, $this>
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Stockables consumed when a detail reaches this stage.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Stockable, $this>
     */
    public function stockables()
    {
        return $this->belongsToMany(Stockable::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<OrderDetail, $this>
     */
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
