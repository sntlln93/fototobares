<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Stockable;
use Illuminate\Database\Seeder;

/**
 * Stockables linked to the migration-seeded products. "Molduras 20x30"
 * ends up below its threshold after DemoOrderSeeder runs, exercising the
 * red row and the dashboard stock alert.
 */
class DemoStockSeeder extends Seeder
{
    public function run(): void
    {
        $murales = Product::whereIn('name', ['Moldura ancha', 'Clásico', 'Moldura fina', 'Moldura fina mini'])
            ->pluck('id')
            ->all();
        $taza = Product::where('name', 'Taza')->firstOrFail();

        $bolsas = Stockable::create(['name' => 'Bolsas de regalo', 'quantity' => 40, 'unit' => 'Unidad', 'alert_at' => 10]);
        $bolsas->products()->sync([...$murales, $taza->id]);

        $molduras = Stockable::create(['name' => 'Molduras 20x30', 'quantity' => 5, 'unit' => 'Unidad', 'alert_at' => 5]);
        $molduras->products()->sync($murales);

        $cajas = Stockable::create(['name' => 'Cajas para tazas', 'quantity' => 25, 'unit' => 'Unidad', 'alert_at' => 5]);
        $cajas->products()->sync([$taza->id]);
    }
}
