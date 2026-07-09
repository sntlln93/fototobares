<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ProductionStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ProductType
 */
class ProductTypeResource extends JsonResource
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
            'statuses' => $this->whenLoaded('productionStatuses', function () {
                return $this->productionStatuses->map(function (ProductionStatus $status) {
                    $detailsCount = $status->getAttribute('details_count');

                    return [
                        'id' => $status->id,
                        'name' => $status->name,
                        'position' => $status->position,
                        'details_count' => is_numeric($detailsCount) ? (int) $detailsCount : 0,
                    ];
                });
            }),
        ];
    }
}
