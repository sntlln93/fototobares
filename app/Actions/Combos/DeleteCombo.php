<?php

declare(strict_types=1);

namespace App\Actions\Combos;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Combos\DeleteComboData;
use Illuminate\Support\Facades\DB;

/**
 * @implements ActionContract<DeleteComboData>
 */
class DeleteCombo implements ActionContract
{
    /**
     * Delete a combo, detaching its products first.
     *
     * @param  DeleteComboData  $params
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
