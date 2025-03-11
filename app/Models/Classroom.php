<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne<Contact, $this>
     */
    public function teacher()
    {
        return $this->morphOne(Contact::class, 'contactable');
    }
}
