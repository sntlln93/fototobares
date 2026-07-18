<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Combo;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ComboSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $variants = [
            'Tipo de foto' => ['Grupo'],
            'Orientación' => ['Vertical', 'Horizontal'],
            'Fondo' => ['Celeste'],
            'Color' => ['Negro', 'Rosa'],
        ];

        $combo1 = Combo::create([
            'name' => 'Combo 1 (M.A)',
            'default_payments' => 4,
            'suggested_price' => 60000,
        ]);

        $combo1->products()->attach([
            $products->firstWhere('name', 'Moldura ancha')?->id => ['quantity' => 1, 'subtract_value' => 30000, 'variants' => $variants],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'subtract_value' => 8000, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'subtract_value' => 2000, 'variants' => null],
        ]);

        $combo2 = Combo::create([
            'name' => 'Combo 2 (CLA)',
            'default_payments' => 4,
            'suggested_price' => 56000,
        ]);

        $combo2->products()->attach([
            $products->firstWhere('name', 'Clásico')?->id => ['quantity' => 1, 'subtract_value' => 28000, 'variants' => $variants],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'subtract_value' => 8000, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'subtract_value' => 2000, 'variants' => null],
        ]);

        $combo3 = Combo::create([
            'name' => 'Combo 3 (M.F)',
            'default_payments' => 4,
            'suggested_price' => 52000,
        ]);

        $combo3->products()->attach([
            $products->firstWhere('name', 'Moldura fina')?->id => ['quantity' => 1, 'subtract_value' => 26000, 'variants' => $variants],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'subtract_value' => 8000, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'subtract_value' => 2000, 'variants' => null],
        ]);

        $combo4 = Combo::create([
            'name' => 'Combo 3 (M.F) con taza',
            'default_payments' => 4,
            'suggested_price' => 64000,
        ]);

        $combo4->products()->attach([
            $products->firstWhere('name', 'Moldura fina')?->id => ['quantity' => 1, 'subtract_value' => 26000, 'variants' => $variants],
            $products->firstWhere('name', 'Carpeta 2 fotos')?->id => ['quantity' => 1, 'subtract_value' => 8000, 'variants' => null],
            $products->firstWhere('name', 'Medalla')?->id => ['quantity' => 1, 'subtract_value' => 2000, 'variants' => null],
            $products->firstWhere('name', 'Taza')?->id => ['quantity' => 1, 'subtract_value' => 5000, 'variants' => null],
        ]);
    }
}
