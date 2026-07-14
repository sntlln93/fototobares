<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\StockableFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stockable extends Model
{
    /** @use HasFactory<StockableFactory> */
    use HasFactory;

    /**
     * Stages that move this stockable's stock, with the signed delta.
     *
     * @return BelongsToMany<ProductionStatus, $this>
     */
    public function productionStatuses()
    {
        return $this->belongsToMany(ProductionStatus::class)
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * @return HasMany<StockMovement, $this>
     */
    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
