<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $casts = [
        'variants' => 'array',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<ProductionStatus, $this>
     */
    public function productionStatuses()
    {
        return $this->hasMany(ProductionStatus::class)->orderBy('position');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Combo, $this>
     */
    public function combos()
    {
        return $this->belongsToMany(Combo::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<ProductType, $this>
     */
    public function type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }
}
