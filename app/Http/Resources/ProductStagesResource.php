<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ProductionStatus;
use App\Models\Stockable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product with its production chain and the stockables each stage
 * consumes, for the stages management screen.
 *
 * @mixin \App\Models\Product
 */
class ProductStagesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type?->name,
            'statuses' => $this->whenLoaded('productionStatuses', function () {
                return $this->productionStatuses->map(function (ProductionStatus $status) {
                    $detailsCount = $status->getAttribute('details_count');

                    return [
                        'id' => $status->id,
                        'name' => $status->name,
                        'position' => $status->position,
                        'details_count' => is_numeric($detailsCount) ? (int) $detailsCount : 0,
                        'stockables' => $status->stockables->map(fn (Stockable $stockable) => [
                            'id' => $stockable->id,
                            'name' => $stockable->name,
                            'unit' => $stockable->unit,
                            'quantity' => (int) $stockable->getRelationValue('pivot')->quantity, // @phpstan-ignore-line
                        ]),
                    ];
                });
            }),
        ];
    }
}
