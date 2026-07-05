<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Product;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrderSaveAndContinueTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Classroom $classroom;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Tester',
            'email' => 'tester@example.com',
            'password' => 'password',
        ]);

        $school = School::create([
            'name' => 'Escuela Test',
            'level' => 'primario',
            'user_id' => $this->user->id,
        ]);

        $this->classroom = Classroom::create([
            'name' => '7mo A',
            'school_id' => $school->id,
        ]);

        DB::table('product_types')->insert(['name' => 'cuadro']);

        $this->product = Product::create([
            'name' => 'Moldura ancha',
            'unit_price' => 48000,
            'max_payments' => 4,
            'product_type_id' => DB::table('product_types')->value('id'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(): array
    {
        return [
            'name' => 'Cliente Test',
            'phone' => '3804123456',
            'classroom_id' => $this->classroom->id,
            'total_price' => 52000,
            'payment_plan' => 4,
            'due_date' => '2026-12-01',
            'child_name' => 'Niño Test',
            'attended_photo_session' => true,
            'order_details' => [
                ['product_id' => $this->product->id, 'note' => 'pose sonriendo'],
            ],
        ];
    }

    public function test_save_and_continue_creates_order_and_redirects_to_create(): void
    {
        $response = $this->actingAs($this->user)->post(
            route('orders.store', ['redirectTo' => route('orders.create')]),
            $this->payload(),
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('orders.create'));
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['child_name' => 'Niño Test']);
        $this->assertDatabaseHas('clients', ['name' => 'Cliente Test']);
        $this->assertDatabaseHas('order_details', ['product_id' => $this->product->id]);
    }

    public function test_save_without_redirect_param_redirects_to_index(): void
    {
        $response = $this->actingAs($this->user)->post(
            route('orders.store'),
            $this->payload(),
        );

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseCount('orders', 1);
    }
}
