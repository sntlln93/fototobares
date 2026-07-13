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
 * Eleven orders covering every state of the manual checklist: pending,
 * in production, priority, finished, partially/fully delivered,
 * cancelled with recycling/stock return, overdue with balance and one
 * without a photo session.
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

        // 1. Pending order: nothing produced, partial cash payment,
        // still editable (paid less than the first installment)
        $order = $this->makeOrder($sextoA, 'Ana Suárez', '3804000001', 'Valentina', 1, 60000, 4, 30);
        $this->addDetail($order, $molduraAncha, $this->muralVariant('vertical', 'pink'), 'Valentina - egresados 2026');
        $this->addDetail($order, $carpeta, null, 'Valentina');
        $this->addDetail($order, $medalla, null, 'Valentina');
        $order->payments()->create(['amount' => 10000, 'type' => 'efectivo']);

        // 2. In production: boards glued (2 MDF boards deducted at
        // "Pegado"), transfer payment
        $order = $this->makeOrder($sextoA, 'Bruno Díaz', '3804000002', 'Thiago', 2, 56000, 4, 20);
        $detail = $this->addDetail($order, $clasico, $this->muralVariant('horizontal', 'black'), 'Thiago - egresados 2026');
        $this->setStatus($detail, $clasico, 3, hoursAgo: 30);
        $this->addDetail($order, $carpeta, null, 'Thiago');
        $order->payments()->create(['amount' => 20000, 'type' => 'transferencia', 'transaction_number' => 'MP73920184652']);

        // 3. Priority: the mural reached "Corte de moldura" (one strip
        // deducted) and was sent back to "Impreso" (stock stays deducted)
        $order = $this->makeOrder($sextoA, 'Carla Medina', '3804000003', 'Lola', 3, 40000, 4, 25);
        $detail = $this->addDetail($order, $molduraFina, $this->muralVariant('vertical', 'black'), 'Lola - egresados 2026');
        $this->setStatus($detail, $molduraFina, 3, hoursAgo: 48);
        $this->setStatus($detail, $molduraFina, 2, priority: true, hoursAgo: 2);

        // 4. Finished and fully paid: ready to deliver with no warning
        $order = $this->makeOrder($sextoA, 'Diego Farías', '3804000004', 'Benjamín', 4, 12000, 1, 10);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Benjamín');
        $this->setStatus($detail, $taza, 4, hoursAgo: 5);
        $order->payments()->create(['amount' => 12000, 'type' => 'efectivo']);

        // 5. Partially delivered: mural handed over (its whole chain
        // consumed: strip + board + bag), the rest in progress
        $order = $this->makeOrder($sextoA, 'Elena Paz', '3804000005', 'Mora', 5, 52000, 4, 15);
        $detail = $this->addDetail($order, $molduraFina, $this->muralVariant('horizontal', 'pink'), 'Mora - egresados 2026');
        $this->setStatus($detail, $molduraFina, 7, hoursAgo: 72);
        $detail->delivered_at = now()->subDays(2);
        $detail->save();
        $detail = $this->addDetail($order, $carpeta, null, 'Mora');
        $this->setStatus($detail, $carpeta, 3, hoursAgo: 24);
        $this->addDetail($order, $medalla, null, 'Mora');
        $order->payments()->create(['amount' => 26000, 'type' => 'transferencia', 'transaction_number' => 'BNA48210937566']);

        // 6. Fully delivered and paid: gone from /tracking
        $order = $this->makeOrder($sextoA, 'Facundo Ríos', '3804000006', 'Ciro', 6, 6000, 1, 5);
        $detail = $this->addDetail($order, $medalla, null, 'Medalla de Ciro');
        $this->setStatus($detail, $medalla, 4, hoursAgo: 96);
        $detail->delivered_at = now()->subDay();
        $detail->save();
        $order->payments()->create(['amount' => 6000, 'type' => 'efectivo']);

        // 7. Cancelled: the glued mural returned its MDF board to stock
        // (movements -1/+1), medalla sent to recycling; keeps a payment
        $order = $this->makeOrder($sextoA, 'Gimena Vera', '3804000007', 'Emma', 7, 54000, 4, 18);
        $detail = $this->addDetail($order, $molduraAncha, $this->muralVariant('vertical', 'black'), 'Emma - egresados 2026');
        $this->setStatus($detail, $molduraAncha, 4, hoursAgo: 60);
        $this->stock->returnForDetail($detail, $this->master);
        $detail->recycled_to = 'stock';
        $detail->save();
        $detail = $this->addDetail($order, $medalla, null, 'Emma');
        $detail->recycled_to = 'reciclaje';
        $detail->save();
        $order->payments()->create(['amount' => 10000, 'type' => 'efectivo']);
        $order->cancelled_at = now()->subDay();
        $order->save();

        // 8. Overdue with balance: feeds the dashboard alert
        $order = $this->makeOrder($sextoA, 'Hernán Luna', '3804000008', 'Isabella', 8, 18000, 2, -15);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Isabella');
        $this->setStatus($detail, $taza, 2, hoursAgo: 120);
        $this->addDetail($order, $medalla, null, 'Isabella');
        $order->payments()->create(['amount' => 9000, 'type' => 'efectivo']);

        // 9. Did not attend the photo session: no photo number assigned
        $order = $this->makeOrder($sextoA, 'Irina Sosa', '3804000009', 'Simón', null, 18000, 1, 12, attended: false);
        $this->addDetail($order, $carpeta, null, 'Simón');

        // Orders on the other schools so the school filters have data
        $order = $this->makeOrder($salaDe5, 'Julia Toledo', '3804000010', 'Bautista', 1, 12000, 1, 18);
        $detail = $this->addDetail($order, $taza, null, 'Taza de Bautista');
        $this->setStatus($detail, $taza, 3, hoursAgo: 12);

        $order = $this->makeOrder($quintoHum, 'Karen Ibáñez', '3804000011', 'Renata', 1, 44000, 4, 22);
        $this->addDetail($order, $clasico, $this->muralVariant('vertical', 'pink'), 'Renata - promo 2026');
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
     * @param  array<string, string>|null  $variant
     */
    private function addDetail(Order $order, Product $product, ?array $variant, string $note): OrderDetail
    {
        $order->products()->attach($product->id, ['variant' => $variant, 'note' => $note]);

        /** @var OrderDetail $detail */
        $detail = OrderDetail::where('order_id', $order->id)
            ->where('product_id', $product->id)
            ->latest('id')
            ->firstOrFail();

        return $detail;
    }

    /**
     * Moves a detail to the given stage mirroring the tracking flow:
     * the service deducts whatever the reached stages consume.
     */
    private function setStatus(OrderDetail $detail, Product $product, int $position, bool $priority = false, int $hoursAgo = 0): void
    {
        $status = ProductionStatus::where('product_id', $product->id)
            ->where('position', $position)
            ->firstOrFail();

        $detail->production_status_id = $status->id;
        $detail->status_updated_at = now()->subHours($hoursAgo);
        $detail->priority = $priority;
        $detail->save();
        $detail->setRelation('productionStatus', $status);

        $this->stock->deductForDetail($detail, $this->master);
    }

    /**
     * @return array<string, string>
     */
    private function muralVariant(string $orientation, string $color): array
    {
        return [
            'orientation' => $orientation,
            'photo_type' => 'grupo',
            'background' => 'blue',
            'color' => $color,
        ];
    }
}
