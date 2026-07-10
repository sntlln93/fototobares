<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductType extends Model
{
    /**
     * @return HasMany<Product, $this>
     */
    public function types()
    {
        return $this->hasMany(Product::class);
    }
}
