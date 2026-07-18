<?php

declare(strict_types=1);

namespace Tests;

use Database\Seeders\CatalogSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected $seeder = CatalogSeeder::class;
}
