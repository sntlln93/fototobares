<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Every product owns its production chain. Seeded products get the
     * real chains dictated by the business; products created later
     * start with a single final stage (see CreateProduct action).
     */
    public function up(): void
    {
        $chainsByType = [
            'mural' => ['Sin foto', 'Impreso', 'Pegado', 'Pintado', 'Laqueado', 'Embolsado'],
            'taza' => ['Pendiente', 'Impreso', 'Estampado', 'Embolsado'],
            'banda' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'medalla' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'carpeta' => ['Pendiente', 'Impreso', 'Armado', 'Embolsado'],
            'foto' => ['Pendiente', 'Impreso', 'Embolsado'],
            'portaretrato' => ['Pendiente', 'Impreso', 'Enmarcado', 'Embolsado'],
        ];

        $products = DB::table('products')
            ->join('product_types', 'product_types.id', '=', 'products.product_type_id')
            ->select('products.id', 'products.name', 'product_types.name as type')
            ->get();

        foreach ($products as $product) {
            $chain = $chainsByType[$product->type] ?? ['Terminado'];

            // The "moldura" murals cut the molding strip to size before
            // gluing; the classic one (two MDF boards) does not
            if (str_starts_with($product->name, 'Moldura')) {
                $chain = ['Sin foto', 'Impreso', 'Corte de moldura', 'Pegado', 'Pintado', 'Laqueado', 'Embolsado'];
            }

            foreach ($chain as $position => $status) {
                DB::insert(
                    'INSERT INTO production_statuses(product_id, name, position) VALUES (:product_id, :name, :position)',
                    [
                        'product_id' => $product->id,
                        'name' => $status,
                        'position' => $position + 1,
                    ]
                );
            }
        }
    }
};
