<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ClassroomFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Classroom extends Model
{
    /** @use HasFactory<ClassroomFactory> */
    use HasFactory;

    /**
     * @return MorphOne<Contact, $this>
     */
    public function teacher()
    {
        return $this->morphOne(Contact::class, 'contactable');
    }

    /**
     * @return BelongsTo<School, $this>
     */
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return HasMany<Photo, $this>
     */
    public function photos()
    {
        return $this->hasMany(Photo::class);
    }
}
