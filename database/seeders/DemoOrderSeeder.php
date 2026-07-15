<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Client;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Database\Seeder;

/**
 * Twelve orders covering every state of the manual checklist: production
 * not yet enabled (first installment unpaid), pending, in production,
 * priority, finished, partially/fully delivered, cancelled with
 * recycling/stock return, overdue with balance, one without a photo
 * session and one with a variant still pending definition (#113). Every
 * order with details in /tracking has its first installment paid —
 * production is gated by it (#106).
 */
class DemoOrderSeeder extends Seeder
{
    private StockService $stock;

    private User $master;

    public function run(): void
    {
        $this->stock = new StockService;
        $this->master = User::where('email', 'sntlln.93@gmail.com')->firstOrFail();

        $sextoA = Classroom::where('name', '6to A')->firstOrFail();
        $salaDe5 = Classroom::where('name', 'Sala de 5')->firstOrFail();
        $quintoHum = Classroom::where('name', '5to Humanidades')->firstOrFail();

        $molduraAncha = Product::where('name', 'Moldura ancha')->firstOrFail();
        $clasico = Product::where('name', 'Clásico')->firstOrFail();
        $molduraFina = Product::where('name', 'Moldura fina')->firstOrFail();
        $carpeta = Product::where('name', 'Carpeta 2 fotos')->firstOrFail();
        $medalla = Product::where('name', 'Medalla')->firstOrFail();
        $taza = Product::where('name', 'Taza')->firstOrFail();
        $banda = Product::where('name', 'Banda')->firstOrFail();

        // 1. Pending order: first installment paid and production enabled,
        // nothing produced yet (all details "sin empezar" in /tracking)
        $order = $this->makeOrder($sextoA, 'Ana Suárez', '3804000001', 'Valentina', 1, 60000, 4, 30);
        $this->addDetail($order, $molduraAncha, $this->muralVariant('vertical', 'pink'), 'Valentina - egresados 2026', enabled: true);
        $this->addDetail($order, $carpeta, null, 'Valentina', enabled: true);
        $this->addDetail($order, $medalla, null, 'Valentina', enabled: true);
        $order->payments()->create(['amount' => 15000, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);
        $order->notes()->create(['body' => 'La mamá pidió que la avisemos por WhatsApp cuando esté lista la moldura.']);
        $order->notes()->create(['body' => 'Confirmar dirección de entrega antes de despachar.']);

        // 2. In production: boards glued (2 MDF boards deducted and 1
        // "armado" produced at "Pegado"), transfer payment
        $order = $this->makeOrder($sextoA, 'Bruno Díaz', '3804000002', 'Thiago', 2, 56000, 4, 20);
        $detail = $this->addDetail($order, $clasico, $this->muralVariant('horizontal', 'black'), 'Thiago - egresados 2026');
        $this->setStatus($detail, $clasico, 3, hoursAgo: 30);
        $this->addDetail($order, $carpeta, null, 'Thiago', enabled: true);
        $order->payments()->create(['amount' => 20000, 'type' => 'transferencia', 'transaction_number' => 'MP73920184652', 'paid_on' => now()->subDays(2)->toDateString()]);

        // 3. Priority: the mural broke after "Corte de moldura" (one strip
        // deducted) and has to be remade, so the office flagged it as
        // priority and sent it back to "Impreso" (stock stays deducted)
        $order = $this->makeOrder($sextoA, 'Carla Medina', '3804000003', 'Lola', 3, 40000, 4, 25);
        $detail = $this->addDetail($order, $molduraFina, $this->muralVariant('vertical', 'black'), 'Lola - egresados 2026');
        $this->setStatus($detail, $molduraFina, 3, hoursAgo: 48);
        $this->setStatus($detail, $molduraFina, 2, priority: true, hoursAgo: 2);
        $order->payments()->create(['amount' => 10000, 'type' => 'efectivo', 'paid_on' => now()->subDays(3)->toDateString()]);

        // 4. Finished and fully paid: ready to deliver with no warning
        $order = $this->makeOrder($sextoA, 'Diego Farías', '3804000004', 'Benjamín', 4, 12000, 1, 10);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Benjamín');
        $this->setStatus($detail, $taza, 4, hoursAgo: 5);
        $order->payments()->create(['amount' => 12000, 'type' => 'efectivo', 'paid_on' => now()->subDays(5)->toDateString()]);

        // 5. Partially delivered: mural handed over (its whole chain
        // consumed: strip + board + bag; the armado produced at "Pegado"
        // is consumed back at "Pintado", net 0), the rest in progress
        $order = $this->makeOrder($sextoA, 'Elena Paz', '3804000005', 'Mora', 5, 52000, 4, 15);
        $detail = $this->addDetail($order, $molduraFina, $this->muralVariant('horizontal', 'pink'), 'Mora - egresados 2026');
        $this->setStatus($detail, $molduraFina, 7, hoursAgo: 72);
        $detail->delivered_at = now()->subDays(2);
        $detail->save();
        $detail = $this->addDetail($order, $carpeta, null, 'Mora');
        $this->setStatus($detail, $carpeta, 3, hoursAgo: 24);
        $this->addDetail($order, $medalla, null, 'Mora', enabled: true);
        $order->payments()->create(['amount' => 26000, 'type' => 'transferencia', 'transaction_number' => 'BNA48210937566', 'paid_on' => now()->subDays(2)->toDateString()]);

        // 6. Fully delivered and paid: gone from /tracking
        $order = $this->makeOrder($sextoA, 'Facundo Ríos', '3804000006', 'Ciro', 6, 6000, 1, 5);
        $detail = $this->addDetail($order, $medalla, null, 'Medalla de Ciro');
        $this->setStatus($detail, $medalla, 4, hoursAgo: 96);
        $detail->delivered_at = now()->subDay();
        $detail->save();
        $order->payments()->create(['amount' => 6000, 'type' => 'efectivo', 'paid_on' => now()->subDays(1)->toDateString()]);

        // 7. Cancelled: the glued mural returned its MDF board to stock
        // ("devolución" +1) and gave back the armado it had produced
        // ("ajuste" -1); medalla sent to recycling; keeps a payment
        $order = $this->makeOrder($sextoA, 'Gimena Vera', '3804000007', 'Emma', 7, 54000, 4, 18);
        $detail = $this->addDetail($order, $molduraAncha, $this->muralVariant('vertical', 'black'), 'Emma - egresados 2026');
        $this->setStatus($detail, $molduraAncha, 4, hoursAgo: 60);
        $this->stock->reverseForDetail($detail, $this->master);
        $detail->recycled_to = 'stock';
        $detail->save();
        $detail = $this->addDetail($order, $medalla, null, 'Emma');
        $detail->recycled_to = 'reciclaje';
        $detail->save();
        $order->payments()->create(['amount' => 14000, 'type' => 'efectivo', 'paid_on' => now()->subDays(1)->toDateString()]);
        $order->cancelled_at = now()->subDay();
        $order->save();

        // 8. Overdue with balance: feeds the dashboard alert
        $order = $this->makeOrder($sextoA, 'Hernán Luna', '3804000008', 'Isabella', 8, 18000, 2, -15);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Isabella');
        $this->setStatus($detail, $taza, 2, hoursAgo: 120);
        $this->addDetail($order, $medalla, null, 'Isabella', enabled: true);
        $order->payments()->create(['amount' => 9000, 'type' => 'efectivo', 'paid_on' => now()->subDays(5)->toDateString()]);

        // 9. Did not attend the photo session: no photo number assigned
        $order = $this->makeOrder($sextoA, 'Irina Sosa', '3804000009', 'Simón', null, 18000, 1, 12, attended: false);
        $this->addDetail($order, $carpeta, null, 'Simón', enabled: true);
        $order->payments()->create(['amount' => 18000, 'type' => 'efectivo', 'paid_on' => now()->subDays(2)->toDateString()]);

        // Orders on the other schools so the school filters have data
        $order = $this->makeOrder($salaDe5, 'Julia Toledo', '3804000010', 'Bautista', 1, 12000, 1, 18);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Bautista');
        $this->setStatus($detail, $taza, 3, hoursAgo: 12);
        $order->payments()->create(['amount' => 12000, 'type' => 'transferencia', 'transaction_number' => 'MP58316742900', 'paid_on' => now()->subDays(1)->toDateString()]);

        // 11. Production not enabled: no payment yet, so the clásico is out
        // of /tracking until the first installment is paid and the office
        // enables it from the order page (#106)
        $order = $this->makeOrder($quintoHum, 'Karen Ibáñez', '3804000011', 'Renata', 1, 44000, 4, 22);
        $this->addDetail($order, $clasico, $this->muralVariant('vertical', 'pink'), 'Renata - promo 2026');

        // 12. Variant defined after the order, per #113: the band's Talle is
        // picked once the child tries it on, not at order time. Sala de 5
        // already holds photo_number 1 (order 10) and 2 (the Sala de 5
        // draft), so this one gets 3
        $order = $this->makeOrder($salaDe5, 'Lucía Ferreyra', '3804000013', 'Delfina', 3, 9000, 1, 14);
        $this->addDetail($order, $banda, $this->bandaVariant(null), 'Delfina', enabled: true);
        $order->payments()->create(['amount' => 9000, 'type' => 'efectivo', 'paid_on' => now()->toDateString()]);
    }

    private function makeOrder(
        Classroom $classroom,
        string $clientName,
        string $phone,
        string $childName,
        ?int $photoNumber,
        int $totalPrice,
        int $paymentPlan,
        int $dueInDays,
        bool $attended = true,
    ): Order {
        $client = Client::create(['name' => $clientName, 'phone' => $phone]);

        return Order::create([
            'client_id' => $client->id,
            'classroom_id' => $classroom->id,
            'total_price' => $totalPrice,
            'payment_plan' => $paymentPlan,
            'due_date' => now()->addDays($dueInDays)->format('Y-m-d'),
            'child_name' => $childName,
            'attended_photo_session' => $attended,
            'photo_number' => $photoNumber,
        ]);
    }

    /**
     * @param  array<int, array{label: string, type: string, value: array{label: string, color?: string}|null}>|null  $variant
     */
    private function addDetail(Order $order, Product $product, ?array $variant, string $note, bool $enabled = false): OrderDetail
    {
        $order->products()->attach($product->id, [
            'variant' => $variant ?? [],
            'note' => $note,
            'production_enabled_at' => $enabled ? now() : null,
        ]);

        /** @var OrderDetail $detail */
        $detail = OrderDetail::where('order_id', $order->id)
            ->where('product_id', $product->id)
            ->latest('id')
            ->firstOrFail();

        return $detail;
    }

    /**
     * Moves a detail to the given stage mirroring the tracking flow: the
     * service applies whatever the reached stages add or consume.
     */
    private function setStatus(OrderDetail $detail, Product $product, int $position, bool $priority = false, int $hoursAgo = 0): void
    {
        $status = ProductionStatus::where('product_id', $product->id)
            ->where('position', $position)
            ->firstOrFail();

        $detail->production_status_id = $status->id;
        $detail->production_enabled_at ??= now()->subHours($hoursAgo);
        $detail->status_updated_at = now()->subHours($hoursAgo);
        $detail->priority = $priority;
        $detail->save();
        $detail->setRelation('productionStatus', $status);

        $this->stock->applyForDetail($detail, $this->master);
    }

    /**
     * @return array<int, array{label: string, type: string, value: array{label: string, color?: string}|null}>
     */
    private function muralVariant(string $orientation, string $color): array
    {
        $orientationLabel = $orientation === 'horizontal' ? 'Horizontal' : 'Vertical';
        $colorOption = $color === 'black'
            ? ['label' => 'Negro', 'color' => '#1c1917']
            : ['label' => 'Rosa', 'color' => '#f9a8d4'];

        return [
            ['label' => 'Tipo de foto', 'type' => 'text', 'value' => ['label' => 'Grupo']],
            ['label' => 'Orientación', 'type' => 'text', 'value' => ['label' => $orientationLabel]],
            ['label' => 'Fondo', 'type' => 'color', 'value' => ['label' => 'Celeste', 'color' => '#93c5fd']],
            ['label' => 'Color', 'type' => 'color', 'value' => $colorOption],
        ];
    }

    /**
     * @return array<int, array{label: string, type: string, value: array{label: string}|null}>
     */
    private function bandaVariant(?string $talle): array
    {
        return [
            ['label' => 'Talle', 'type' => 'text', 'value' => $talle !== null ? ['label' => $talle] : null],
        ];
    }
}
