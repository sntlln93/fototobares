<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Classroom;
use App\Models\Order;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Lightweight, print-only serialization of an order for the sticker sheet:
 * just what the label shows, none of the order-management fields
 * `OrderResource` carries.
 *
 * @mixin Order
 */
class StickerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Classroom $classroom */
        $classroom = $this->classroom;

        /** @var School $school */
        $school = $classroom->school;

        $photo = $this->photo();

        return [
            'id' => $this->id,
            'order_number' => $this->id,
            'child_name' => $this->child_name,
            'school_name' => $school->name,
            'classroom_name' => $classroom->name,
            'photo_url' => $photo !== null ? Storage::url($photo->file_path) : null,
            'products' => $this->products
                ->filter(fn ($product) => $product->pivot->recycled_to === null) // @phpstan-ignore-line
                ->map(fn ($product) => [
                    'name' => $product->name,
                    'variant' => $product->pivot->variant, // @phpstan-ignore-line
                ])
                ->values(),
        ];
    }
}
