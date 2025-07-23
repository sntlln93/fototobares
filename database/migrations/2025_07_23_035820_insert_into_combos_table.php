<?php

declare(strict_types=1);

use App\Models\Combo;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $products = Product::all();
        $variants = [
            'colors' => ['black', 'pink'],
            'dimentions' => '20x30',
            'backgrounds' => ['blue'],
            'photo_types' => ['grupo'],
            'orientations' => ['vertical', 'horizontal'],
        ];

        $combo1 = Combo::create([
            'name' => 'Combo 1 (M.A)',
            'suggested_financed_price' => 64000,
            'suggested_max_payments' => 4,
            'suggested_price' => 60000,
        ]);

        $combo1->products()->attach([
            $products->firstWhere('name', 'Moldura ancha')?->id => ['quantity' => 1, 'variants' => json_encode($variants)],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'variants' => null],
        ]);

        $combo2 = Combo::create([
            'name' => 'Combo 2 (CLA)',
            'suggested_financed_price' => 60000,
            'suggested_max_payments' => 4,
            'suggested_price' => 56000,
        ]);

        $combo2->products()->attach([
            $products->firstWhere('name', 'Clásico')?->id => ['quantity' => 1, 'variants' => json_encode($variants)],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'variants' => null],
        ]);

        $combo3 = Combo::create([
            'name' => 'Combo 3 (M.F)',
            'suggested_financed_price' => 56000,
            'suggested_max_payments' => 4,
            'suggested_price' => 52000,
        ]);

        $combo3->products()->attach([
            $products->firstWhere('name', 'Moldura fina')?->id => ['quantity' => 1, 'variants' => json_encode($variants)],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'variants' => null],
        ]);

        $combo4 = Combo::create([
            'name' => 'Combo 3 (M.F) con taza',
            'suggested_financed_price' => 68000,
            'suggested_max_payments' => 4,
            'suggested_price' => 64000,
        ]);

        $combo4->products()->attach([
            $products->firstWhere('name', 'Moldura fina')?->id => ['quantity' => 1, 'variants' => json_encode($variants)],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'variants' => null],
            $products->firstWhere('name', 'Taza')?->id => ['quantity' => 1, 'variants' => null],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
