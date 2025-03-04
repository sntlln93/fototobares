<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Address extends Model
{
    /** @use HasFactory<\Database\Factories\AddressFactory> */
    use HasFactory;

    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }

    public function __toString()
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
