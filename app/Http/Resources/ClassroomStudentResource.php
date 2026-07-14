<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDraft;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A single flat row for the classroom's children listing, normalizing an
 * Order or an OrderDraft into the same shape: neither the heavy OrderResource
 * payload nor the draft's own resource fit the table as-is.
 */
class ClassroomStudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $row = $this->resource;

        if ($row instanceof OrderDraft) {
            return [
                'kind' => 'draft',
                'id' => $row->id,
                'photo_number' => $row->photo_number,
                'child_name' => $row->child_name,
                'client_name' => $row->client_name,
                'client_phone' => $row->client_phone,
                'products_count' => count($row->products ?? []),
                'total_price' => $row->total_price,
                'payment_plan' => $row->payment_plan,
                'due_date' => $row->due_date?->isoFormat('D [de] MMM Y'),
            ];
        }

        /** @var Order $row */
        /** @var Client $client */
        $client = $row->client;

        $productsCount = $row->getAttribute('products_count');

        return [
            'kind' => 'order',
            'id' => $row->id,
            'photo_number' => $row->photo_number,
            'child_name' => $row->child_name,
            'client_name' => $client->name,
            'client_phone' => $client->phone,
            'products_count' => is_numeric($productsCount) ? (int) $productsCount : 0,
            'total_price' => $row->total_price,
            'payment_plan' => $row->payment_plan,
            'due_date' => $row->due_date->isoFormat('D [de] MMM Y'),
        ];
    }
}
