<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    public function teacher(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Contact::class, 'contactable');
    }
}
