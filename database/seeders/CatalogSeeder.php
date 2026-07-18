<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * The real product catalog: types are bootstrapped by migrations, but
 * products/production chains/combos are business data, not schema, so
 * they're seeded rather than inserted by a migration.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProductSeeder::class,
            ProductionStatusSeeder::class,
            ComboSeeder::class,
        ]);
    }
}
