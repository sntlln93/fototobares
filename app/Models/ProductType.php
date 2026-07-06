<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Product, $this>
     */
    public function types()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<ProductionStatus, $this>
     */
    public function productionStatuses()
    {
        return $this->hasMany(ProductionStatus::class)->orderBy('position');
    }
}
