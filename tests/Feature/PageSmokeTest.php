<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\Combo;
use App\Models\Order;
use App\Models\Product;
use App\Models\School;
use App\Models\Stockable;
use App\Models\User;
use Database\Seeders\DemoSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

/**
 * Regression net for lazy loading (and any other 5xx): renders every
 * authenticated GET page with the demo seed, so a resource touching a
 * relation its controller forgot to eager load fails here instead of
 * in front of the client. New routes are picked up automatically.
 */
it('keeps lazy loading prevention enabled', function () {
    expect(Model::preventsLazyLoading())->toBeTrue();
});

it('renders every GET page without errors', function () {
    $this->seed(DemoSeeder::class);
    actingAsRole(UserRole::Master);

    $skipped = ['login', 'storage.local', 'sanctum.csrf-cookie', 'pulse'];
    $failures = [];

    foreach (Route::getRoutes() as $route) {
        $name = $route->getName();

        if ($name === null || in_array($name, $skipped, true) || str_starts_with($name, 'livewire')) {
            continue;
        }

        if (! in_array('GET', $route->methods(), true) || ! in_array('web', $route->gatherMiddleware(), true)) {
            continue;
        }

        $parameters = [];

        foreach ($route->parameterNames() as $parameter) {
            $model = match ($parameter) {
                'classroom' => Classroom::first(),
                'combo' => Combo::first() ?? Combo::create([
                    'name' => 'Combo smoke',
                    'suggested_price' => 64000,
                    'suggested_max_payments' => 4,
                ]),
                'order' => Order::first(),
                'product' => Product::first(),
                'school' => School::first(),
                'stockable' => Stockable::first(),
                'user' => User::first(),
                default => null,
            };

            if ($model === null) {
                $failures[] = "{$name}: no demo data for {{$parameter}}";

                continue 2;
            }

            $parameters[$parameter] = $model;
        }

        $status = get(route($name, $parameters))->status();

        if ($status >= 400) {
            $failures[] = "{$name} responded {$status}";
        }
    }

    expect($failures)->toBe([]);
});
