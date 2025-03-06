<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class School extends Model
{
    /** @use HasFactory<\Database\Factories\SchoolFactory> */
    use HasFactory;

    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }

    public function principal(): MorphOne
    {
        return $this->morphOne(Contact::class, 'contactable');
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function teachers()
    {
        return $this->hasManyThrough(Contact::class, Classroom::class, 'school_id', 'id')
            ->where('contactable_type', Classroom::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
