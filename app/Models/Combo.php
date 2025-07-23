<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property ?Pivot $pivot
 */
class Combo extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Product, $this>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->using(ComboProduct::class)
            ->as('pivot')
            ->withPivot(['variants']);
    }
}
