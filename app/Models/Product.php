<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $casts = [
        'variants' => 'array',
    ];

    public function stockables()
    {
        return $this->belongsToMany(Stockable::class);
    }

    public function combos()
    {
        return $this->belongsToMany(Combo::class);
    }
}
