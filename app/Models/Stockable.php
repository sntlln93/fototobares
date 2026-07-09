<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stockable extends Model
{
    /** @use \Illuminate\Database\Eloquent\Factories\HasFactory<\Database\Factories\StockableFactory> */
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    /**
     * Stages that consume this stockable, with the consumed quantity.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<ProductionStatus, $this>
     */
    public function productionStatuses()
    {
        return $this->belongsToMany(ProductionStatus::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<StockMovement, $this>
     */
    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
