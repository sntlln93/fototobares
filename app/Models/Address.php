<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    public function addressable(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo();
    }

    public function __toString(): string
    {
        $full_address = '';

        if ($this->street) {
            $full_address .= $this->street;
        }

        if ($this->number) {
            $full_address .= strlen($full_address) < 1
            ? "S/N N° $this->number"
            : " N° $this->number";
        }

        if ($this->neighborhood) {
            $full_address .= strlen($full_address) < 1
            ? "B° $this->neighborhood"
            : ", B° $this->neighborhood";
        }

        if ($this->city) {
            $full_address .= strlen($full_address) < 1
            ? $this->city
            : ", $this->city";
        }

        return $full_address;
    }
}
