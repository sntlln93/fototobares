<?php

declare(strict_types=1);

namespace App\Actions\Combos;

use App\Contracts\ActionContract;
use App\Models\Combo;
use Illuminate\Support\Facades\DB;

class DeleteCombo implements ActionContract
{
    /**
     * Delete a combo, detaching its products first.
     *
     * @param  array<string, mixed>  $params  {combo: Combo}
     */
    public function handle(array $params): void
    {
        /** @var Combo $combo */
        $combo = $params['combo'];

        DB::transaction(function () use ($combo) {
            $combo->products()->detach();
            $combo->delete();
        });
    }
}
