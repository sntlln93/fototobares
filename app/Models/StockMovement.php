<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Stockable, $this>
     */
    public function stockable()
    {
        return $this->belongsTo(Stockable::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<OrderDetail, $this>
     */
    public function orderDetail()
    {
        return $this->belongsTo(OrderDetail::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
