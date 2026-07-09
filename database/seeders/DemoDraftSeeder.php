<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Combo;
use App\Models\OrderDraft;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * One complete draft (prefills the whole order form when loaded) and one
 * barely started.
 */
class DemoDraftSeeder extends Seeder
{
    public function run(): void
    {
        $sextoB = Classroom::where('name', '6to B')->firstOrFail();
        $salaDe5 = Classroom::where('name', 'Sala de 5')->firstOrFail();

        $combo1 = Combo::where('name', 'Combo 1 (M.A)')->firstOrFail();
        $molduraAncha = Product::where('name', 'Moldura ancha')->firstOrFail();
        $carpeta = Product::where('name', 'Carpeta 2 fotos')->firstOrFail();
        $medalla = Product::where('name', 'Medalla')->firstOrFail();

        OrderDraft::create([
            'classroom_id' => $sextoB->id,
            'child_name' => 'Felipe',
            'client_name' => 'Laura Benítez',
            'client_phone' => '3804000012',
            'attended_photo_session' => true,
            'total_price' => 60000,
            'payment_plan' => 4,
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'products' => [
                [
                    'combo_id' => $combo1->id,
                    'product_id' => $molduraAncha->id,
                    'variant' => [
                        'orientation' => 'vertical',
                        'photo_type' => 'grupo',
                        'background' => 'blue',
                        'color' => 'black',
                    ],
                    'note' => 'Felipe - egresados 2026',
                ],
                ['combo_id' => $combo1->id, 'product_id' => $carpeta->id, 'note' => 'Felipe'],
                ['combo_id' => $combo1->id, 'product_id' => $medalla->id, 'note' => 'Felipe'],
            ],
        ]);

        OrderDraft::create([
            'classroom_id' => $salaDe5->id,
            'child_name' => 'Guadalupe',
            'products' => [],
        ]);
    }
}
