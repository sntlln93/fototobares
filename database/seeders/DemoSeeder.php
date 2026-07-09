<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Demo dataset for manual testing. Covers every state of the manual
 * checklist — drafts, payments, production stages, priority, partial and
 * total deliveries, cancellation with recycling/stock return, stock
 * alerts and one user per role — so the app is fully browsable right
 * after `migrate:fresh --seed`.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DemoUserSeeder::class,
            DemoSchoolSeeder::class,
            DemoStockSeeder::class,
            DemoOrderSeeder::class,
            DemoDraftSeeder::class,
        ]);
    }
}
