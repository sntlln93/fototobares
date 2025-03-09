<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Combo extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Product, $this>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['quantity', 'variants']);
    }
}
