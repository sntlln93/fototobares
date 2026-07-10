<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    /**
     * @return BelongsTo<Stockable, $this>
     */
    public function stockable()
    {
        return $this->belongsTo(Stockable::class);
    }

    /**
     * @return BelongsTo<OrderDetail, $this>
     */
    public function orderDetail()
    {
        return $this->belongsTo(OrderDetail::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
