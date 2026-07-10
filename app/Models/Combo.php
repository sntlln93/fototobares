<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property ?Pivot $pivot
 */
class Combo extends Model
{
    use SoftDeletes;

    /**
     * @return BelongsToMany<Product, $this, ComboProduct>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->using(ComboProduct::class)
            ->as('pivot')
            ->withPivot(['variants', 'quantity']);
    }
}
