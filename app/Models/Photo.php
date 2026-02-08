<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $classroom_id
 * @property string $file_path
 * @property int $number
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Photo extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'classroom_id',
        'file_path',
        'number',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'number' => 'integer',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Classroom, $this>
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}
