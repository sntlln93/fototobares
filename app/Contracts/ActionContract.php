<?php

declare(strict_types=1);

namespace App\Contracts;

/**
 * Contract for single-responsibility Actions: one thing, one entrypoint.
 *
 * Every action receives its inputs as a single associative array so the
 * contract can share one signature across heterogeneous actions (PHP method
 * signatures are invariant). Actions keep their own specific return type via
 * covariance — hence no native return type here, only the docblock.
 */
interface ActionContract
{
    /**
     * @param  array<string, mixed>  $params
     * @return mixed
     */
    public function handle(array $params);
}
