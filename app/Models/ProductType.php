<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    public function types()
    {
        return $this->hasMany(Product::class);
    }
}
