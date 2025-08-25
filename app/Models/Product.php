<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $casts = [
        'variants' => 'array',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Stockable, $this>
     */
    public function stockables()
    {
        return $this->belongsToMany(Stockable::class);
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
