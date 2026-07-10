<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @return HasMany<ProductionStatus, $this>
     */
    public function productionStatuses()
    {
        return $this->hasMany(ProductionStatus::class)->orderBy('position');
    }

    /**
     * @return BelongsToMany<Combo, $this>
     */
    public function combos()
    {
        return $this->belongsToMany(Combo::class);
    }

    /**
     * @return BelongsTo<ProductType, $this>
     */
    public function type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }

    protected $casts = [
        'variants' => 'array',
    ];
}
