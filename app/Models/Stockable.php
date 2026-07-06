<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stockable extends Model
{
    /** @use \Illuminate\Database\Eloquent\Factories\HasFactory<\Database\Factories\StockableFactory> */
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Product, $this>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<StockMovement, $this>
     */
    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
