<?php

declare(strict_types=1);

namespace App\Actions\Combos;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Combos\ComboDeletionData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<ComboDeletionData>
 */
class DeleteComboAction implements ActionContract
{
    /**
     * Delete a combo, detaching its products first.
     *
     * @param  ComboDeletionData  $params
     */
    public function handle(DtoContract $params): void
    {
        $combo = $params->combo;

        DB::transaction(function () use ($combo) {
            $combo->products()->detach();
            $combo->delete();
        });
    }
}
