<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\OrderDraft;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrderDraft
 */
class OrderDraftResource extends JsonResource
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
            'photo_number' => $this->photo_number,
            'child_name' => $this->child_name,
            'client_name' => $this->client_name,
            'client_phone' => $this->client_phone,
            'attended_photo_session' => $this->attended_photo_session,
            'total_price' => $this->total_price,
            'payment_plan' => $this->payment_plan,
            'due_date' => $this->due_date,
            'products' => $this->products,
            'classroom' => new ClassroomResource($this->classroom),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
