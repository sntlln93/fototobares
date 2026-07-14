<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductionStatus;
use App\Models\Stockable;
use Illuminate\Database\Seeder;

/**
 * Stockables hung from the production stages that move them.
 * "Tiras de moldura fina" ends up below its threshold after
 * DemoOrderSeeder runs, exercising the red row and the dashboard alert.
 * Every mural also assembles a "Murales armados" intermediate at "Pegado"
 * and consumes it back at "Pintado", so a mural cancelled to reciclaje
 * before painting leaves the assembled frame in stock, reusable elsewhere.
 */
class DemoStockSeeder extends Seeder
{
    public function run(): void
    {
        $murales = ['Moldura ancha', 'Clásico', 'Moldura fina', 'Moldura fina mini'];

        $bolsas = Stockable::create(['name' => 'Bolsas de regalo', 'quantity' => 40, 'unit' => 'Unidad', 'alert_at' => 10]);
        $planchas = Stockable::create(['name' => 'Planchas de MDF', 'quantity' => 30, 'unit' => 'Unidad', 'alert_at' => 8]);
        $tiras = Stockable::create(['name' => 'Tiras de moldura fina (3m)', 'quantity' => 5, 'unit' => 'Unidad', 'alert_at' => 5]);
        $cajas = Stockable::create(['name' => 'Cajas para tazas', 'quantity' => 25, 'unit' => 'Unidad', 'alert_at' => 5]);
        $armados = Stockable::create(['name' => 'Murales armados (sin pintar)', 'quantity' => 0, 'unit' => 'Unidad', 'alert_at' => 0]);

        // Every mural gets bagged; the classic one glues two MDF boards,
        // the moldura ones glue one board and cut a molding strip first.
        // Gluing also assembles the frame, consumed back once it's painted.
        foreach ($murales as $name) {
            $this->consume($name, 'Embolsado', $bolsas, 1);
            $this->consume($name, 'Pegado', $planchas, $name === 'Clásico' ? 2 : 1);
            $this->produce($name, 'Pegado', $armados, 1);
            $this->consume($name, 'Pintado', $armados, 1);
        }

        $this->consume('Moldura fina', 'Corte de moldura', $tiras, 1);
        $this->consume('Moldura fina mini', 'Corte de moldura', $tiras, 1);

        $this->consume('Taza', 'Embolsado', $cajas, 1);
        $this->consume('Taza', 'Embolsado', $bolsas, 1);
    }

    private function consume(string $productName, string $stageName, Stockable $stockable, int $quantity): void
    {
        $this->move($productName, $stageName, $stockable, -$quantity);
    }

    private function produce(string $productName, string $stageName, Stockable $stockable, int $quantity): void
    {
        $this->move($productName, $stageName, $stockable, $quantity);
    }

    private function move(string $productName, string $stageName, Stockable $stockable, int $delta): void
    {
        $product = Product::where('name', $productName)->firstOrFail();

        $stage = ProductionStatus::query()
            ->where('product_id', $product->id)
            ->where('name', $stageName)
            ->firstOrFail();

        $stage->stockables()->attach($stockable->id, ['quantity' => $delta]);
    }
}
