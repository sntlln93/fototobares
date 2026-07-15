<?php

declare(strict_types=1);

namespace App\Contracts;

/**
 * Contract for single-responsibility Actions: one thing, one entrypoint.
 *
 * Every action receives its inputs as a DtoContract so the contract can
 * share one signature across heterogeneous actions (PHP method signatures
 * are invariant). Each implementation binds the generic TParams to its own
 * DTO via `@implements ActionContract<ItsData>`, so PHPStan narrows $params
 * inside handle() without a runtime check. Actions keep their own specific
 * return type via covariance — hence no native return type here, only the
 * docblock.
 *
 * @template TParams of DtoContract
 */
interface ActionContract
{
    /**
     * @param  TParams  $params
     * @return mixed
     */
    public function handle(DtoContract $params);
}
