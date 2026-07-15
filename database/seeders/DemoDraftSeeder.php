<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Actions\Orders\CreateOrderDraftAction;
use App\Data\Orders\OrderDraftCreationData;
use App\Models\Classroom;
use App\Models\Combo;
use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * One complete draft (prefills the whole order form when loaded) and one
 * barely started. Created through CreateOrderDraftAction so photo_number is
 * allocated via the real path, same as any other draft.
 */
class DemoDraftSeeder extends Seeder
{
    public function run(): void
    {
        $sextoB = Classroom::where('name', '6to B')->firstOrFail();
        $salaDe5 = Classroom::where('name', 'Sala de 5')->firstOrFail();

        $combo1 = Combo::where('name', 'Combo 1 (M.A)')->firstOrFail();
        $molduraAncha = Product::where('name', 'Moldura ancha')->firstOrFail();
        $carpeta = Product::where('name', 'Carpeta 2 fotos')->firstOrFail();
        $medalla = Product::where('name', 'Medalla')->firstOrFail();

        $action = app(CreateOrderDraftAction::class);

        $action->handle(new OrderDraftCreationData(
            classroomId: $sextoB->id,
            childName: 'Felipe',
            clientName: 'Laura Benítez',
            clientPhone: '3804000012',
            attendedPhotoSession: true,
            totalPrice: 60000,
            paymentPlan: 4,
            dueDate: now()->addDays(30)->format('Y-m-d'),
            products: [
                [
                    'combo_id' => $combo1->id,
                    'product_id' => $molduraAncha->id,
                    'variant' => [
                        'Tipo de foto' => 'Grupo',
                        'Orientación' => 'Vertical',
                        'Fondo' => 'Celeste',
                        'Color' => 'Negro',
                    ],
                    'note' => 'Felipe - egresados 2026',
                ],
                ['combo_id' => $combo1->id, 'product_id' => $carpeta->id, 'note' => 'Felipe'],
                ['combo_id' => $combo1->id, 'product_id' => $medalla->id, 'note' => 'Felipe'],
            ],
        ));

        $action->handle(new OrderDraftCreationData(
            classroomId: $salaDe5->id,
            childName: 'Guadalupe',
            clientName: null,
            clientPhone: null,
            attendedPhotoSession: null,
            totalPrice: null,
            paymentPlan: null,
            dueDate: null,
            products: [],
        ));
    }
}
