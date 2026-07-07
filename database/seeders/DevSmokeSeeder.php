<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\Stockable;
use Illuminate\Database\Seeder;

/**
 * Development-only seeder to exercise the production/delivery/recycling
 * flows against the dev server. Safe to run multiple times only on a
 * fresh database.
 */
class DevSmokeSeeder extends Seeder
{
    public function run(): void
    {
        $classroom = \App\Models\Classroom::firstOrFail();

        $mural = Product::whereHas('type', fn ($q) => $q->where('name', 'mural'))->firstOrFail();
        $taza = Product::whereHas('type', fn ($q) => $q->where('name', 'taza'))->firstOrFail();

        $bolsas = Stockable::create([
            'name' => 'Bolsas',
            'quantity' => 10,
            'unit' => 'Unidad',
            'alert_at' => 5,
        ]);
        $bolsas->products()->sync([$mural->id, $taza->id]);

        $client1 = Client::create(['name' => 'Juan Pérez', 'phone' => '3804000001']);
        $order1 = Order::create([
            'client_id' => $client1->id,
            'classroom_id' => $classroom->id,
            'total_price' => 64000,
            'payment_plan' => 4,
            'due_date' => now()->subDays(10)->format('Y-m-d'),
            'child_name' => 'Martina',
            'attended_photo_session' => true,
            'photo_number' => 1,
        ]);
        $order1->products()->attach($mural->id, [
            'variant' => json_encode([
                'orientation' => 'vertical',
                'photo_type' => 'individual',
                'background' => 'blue',
                'color' => 'brown',
            ]),
            'note' => 'Martina - egresados 2026',
        ]);
        $order1->products()->attach($taza->id, [
            'variant' => json_encode([]),
            'note' => 'Taza con nombre',
        ]);
        $order1->payments()->create(['amount' => 16000, 'type' => 'efectivo']);

        $client2 = Client::create(['name' => 'Ana Gómez', 'phone' => '3804000002']);
        $order2 = Order::create([
            'client_id' => $client2->id,
            'classroom_id' => $classroom->id,
            'total_price' => 12000,
            'payment_plan' => 1,
            'due_date' => now()->addDays(20)->format('Y-m-d'),
            'child_name' => 'Pedro',
            'attended_photo_session' => true,
            'photo_number' => 2,
        ]);
        $order2->products()->attach($taza->id, [
            'variant' => json_encode([]),
            'note' => 'Taza de Pedro',
        ]);
    }
}
