<?php

namespace Database\Seeders;

use App\Models\Combo;
use App\Models\Product;
use App\Models\School;
use App\Models\Stockable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();

        User::factory()->create([
            'name' => 'Agustín Perez',
            'email' => 'agustin@fototobares.com',
        ]);

        User::factory()->create([
            'name' => 'Matías Santillán',
            'email' => 'sntlln.93@gmail.com',
        ]);

        Product::factory(10)->create();
        Combo::factory(3)->create();

        Stockable::factory(20)->create();

        DB::insert('insert into product_stockable(product_id, stockable_id) values (1,1)');

        School::factory(3)->withClassRooms()->withPrincipal()->withAddress()->create();
    }
}
