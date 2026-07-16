<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EditorOrderDetailAssignment extends Model
{
    protected $casts = [
        'assigned_at' => 'datetime',
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
    public function editor()
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
