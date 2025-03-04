<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Combo extends Model
{
    /** @use HasFactory<\Database\Factories\ComboFactory> */
    use HasFactory;

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['quantity', 'variants']);
    }
}
