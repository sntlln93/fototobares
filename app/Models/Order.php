<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Client, $this>
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Product, $this>
     */
    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('quantity', 'price', 'note', 'variant', 'delivered_at')
            ->withTimestamps();
    }
}
