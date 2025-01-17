<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stockable extends Model
{
    /** @use HasFactory<\Database\Factories\StockableFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'unit', 'quantity', 'alert_at',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}
