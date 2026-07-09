<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionStatus extends Model
{
    public $timestamps = false;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<ProductType, $this>
     */
    public function productType()
    {
        return $this->belongsTo(ProductType::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<OrderDetail, $this>
     */
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
