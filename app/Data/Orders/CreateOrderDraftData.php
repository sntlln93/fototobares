<?php

declare(strict_types=1);

namespace App\Data\Orders;

use App\Contracts\DtoContract;

final readonly class CreateOrderDraftData implements DtoContract
{
    /**
     * @param  array<int, array<string, mixed>>|null  $products
     */
    public function __construct(
        public int $classroomId,
        public ?string $childName,
        public ?string $clientName,
        public ?string $clientPhone,
        public ?bool $attendedPhotoSession,
        public ?float $totalPrice,
        public ?int $paymentPlan,
        public ?string $dueDate,
        public ?array $products,
    ) {}
}
