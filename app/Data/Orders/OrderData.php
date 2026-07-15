<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

/**
 * Shared payload for CreateOrderAction and UpdateOrderAction (both fed by
 * StoreOrderRequest). OrderUpdateData composes this rather than duplicating
 * its fields; UpdateOrderAction simply ignores classroomId/draftId.
 */
final readonly class OrderData implements DtoContract
{
    /**
     * @param  list<OrderDetailData>  $orderDetails
     */
    public function __construct(
        public ?string $name,
        public ?string $phone,
        public int $classroomId,
        public float $totalPrice,
        public int $paymentPlan,
        public string $dueDate,
        public ?string $childName,
        public ?bool $attendedPhotoSession,
        public ?int $draftId,
        public array $orderDetails,
    ) {}
}
