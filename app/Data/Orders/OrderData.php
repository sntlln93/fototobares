<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

/**
 * Shared payload for CreateOrder and UpdateOrder (both fed by
 * StoreOrderRequest). UpdateOrderData composes this rather than duplicating
 * its fields; UpdateOrder simply ignores classroomId/draftId.
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
