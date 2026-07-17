<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EditingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderEditingStatusChange extends Model
{
    protected $casts = [
        'status' => EditingStatus::class,
        'changed_at' => 'datetime',
    ];

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
    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
