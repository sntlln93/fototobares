<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $product_types = ProductType::all();

        $variants = [
            ['label' => 'Tipo de foto', 'type' => 'text', 'nullable' => false, 'options' => [
                ['label' => 'Grupo'],
            ]],
            ['label' => 'Orientación', 'type' => 'text', 'nullable' => false, 'options' => [
                ['label' => 'Vertical'],
                ['label' => 'Horizontal'],
            ]],
            ['label' => 'Fondo', 'type' => 'color', 'nullable' => false, 'options' => [
                ['label' => 'Celeste', 'color' => '#93c5fd'],
            ]],
            ['label' => 'Color', 'type' => 'color', 'nullable' => false, 'options' => [
                ['label' => 'Negro', 'color' => '#1c1917'],
                ['label' => 'Rosa', 'color' => '#f9a8d4'],
            ]],
        ];

        $bandaVariants = [
            ['label' => 'Talle', 'type' => 'text', 'nullable' => true, 'options' => [
                ['label' => 'Único'],
                ['label' => 'S'],
                ['label' => 'M'],
                ['label' => 'L'],
            ]],
        ];

        $products = [
            [
                'name' => 'Moldura ancha',
                'financed_price' => 52000,
                'max_payments' => 4,
                'unit_price' => 48000,
                'product_type_id' => $product_types->firstWhere('name', 'mural')->id,
                'variants' => $variants,
            ],
            [
                'name' => 'Clásico',
                'financed_price' => 48000,
                'max_payments' => 4,
                'unit_price' => 44000,
                'product_type_id' => $product_types->firstWhere('name', 'mural')->id,
                'variants' => $variants,
            ],
            [
                'name' => 'Moldura fina',
                'financed_price' => 44000,
                'max_payments' => 4,
                'unit_price' => 40000,
                'product_type_id' => $product_types->firstWhere('name', 'mural')->id,
                'variants' => $variants,
            ],
            [
                'name' => 'Moldura fina mini',
                'financed_price' => 40000,
                'max_payments' => 4,
                'unit_price' => 36000,
                'product_type_id' => $product_types->firstWhere('name', 'mural')->id,
                'variants' => $variants,
            ],
            [
                'name' => 'Carpeta 2 fotos',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 18000,
                'product_type_id' => $product_types->firstWhere('name', 'carpeta')->id,
            ],
            [
                'name' => 'Medalla',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 6000,
                'product_type_id' => $product_types->firstWhere('name', 'medalla')->id,
            ],
            [
                'name' => 'Taza',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 12000,
                'product_type_id' => $product_types->firstWhere('name', 'taza')->id,
            ],
            [
                'name' => 'Portaretrato 15x21',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 15000,
                'product_type_id' => $product_types->firstWhere('name', 'portaretrato')->id,
            ],
            [
                'name' => 'Cuadro 20x30',
                'financed_price' => 28000,
                'max_payments' => 4,
                'unit_price' => 28000,
                'product_type_id' => $product_types->firstWhere('name', 'mural')->id,
                // Murals must carry variants: the UI renders their pickers
                'variants' => $variants,
            ],
            [
                'name' => 'Foto 15x21',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 7500,
                'product_type_id' => $product_types->firstWhere('name', 'foto')->id,
            ],
            [
                'name' => 'Foto 20x30',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 10000,
                'product_type_id' => $product_types->firstWhere('name', 'foto')->id,
            ],
            [
                'name' => 'Foto 30x40',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 13000,
                'product_type_id' => $product_types->firstWhere('name', 'foto')->id,
            ],
            [
                'name' => 'Banda',
                'financed_price' => null,
                'max_payments' => 1,
                'unit_price' => 9000,
                'product_type_id' => $product_types->firstWhere('name', 'banda')->id,
                'variants' => $bandaVariants,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
