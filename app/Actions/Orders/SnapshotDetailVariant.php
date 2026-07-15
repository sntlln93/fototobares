<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Contracts\ActionContract;
use App\Contracts\DtoContract;
use App\Data\Orders\SnapshotDetailVariantData;

/**
 * @implements ActionContract<SnapshotDetailVariantData>
 */
class SnapshotDetailVariant implements ActionContract
{
    /**
     * Builds a self-contained variant snapshot from a product's variant
     * definitions and a client-selected value per label. The backend never
     * trusts client-sent labels/hexes for the option: it looks them up in
     * the definitions, so the snapshot survives later edits to the product
     * and views can render it without joining back to the product.
     *
     * @param  SnapshotDetailVariantData  $params
     * @return array<int, array{label: string, type: string, value: array{label: string, color?: string|null}|null}>
     */
    public function handle(DtoContract $params): array
    {
        $definitions = $params->definitions;
        $selection = $params->selection;

        return array_map(function (array $definition) use ($selection) {
            $selectedLabel = $selection[$definition['label']] ?? null;

            $option = $selectedLabel !== null
                ? collect($definition['options'])->firstWhere('label', $selectedLabel)
                : null;

            return [
                'label' => $definition['label'],
                'type' => $definition['type'],
                'value' => $option !== null ? [
                    'label' => $option['label'],
                    'color' => $option['color'] ?? null,
                ] : null,
            ];
        }, $definitions);
    }
}
