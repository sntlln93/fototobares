<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StickerPrintRequest;
use App\Http\Resources\StickerResource;
use App\Models\Classroom;
use App\Models\Order;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StickerController extends Controller
{
    public function index(Request $request): Response
    {
        $school_id = $request->filled('school_id') ? $request->integer('school_id') : null;
        $classroom_id = $request->filled('classroom_id') ? $request->integer('classroom_id') : null;

        $schools = School::query()
            ->with(['classrooms'])
            ->whereHas('classrooms')
            ->get();

        $orders = Order::with('classroom.school', 'details.productionStatus')
            ->forSchool($school_id)
            ->forClassroom($classroom_id)
            ->orderBy('id')
            ->get();

        return Inertia::render('stickers/index', [
            'orders' => $orders->map(function (Order $order) {
                /** @var Classroom $classroom */
                $classroom = $order->classroom;

                /** @var School $school */
                $school = $classroom->school;

                return [
                    'id' => $order->id,
                    'order_number' => $order->id,
                    'child_name' => $order->child_name,
                    'school_name' => $school->name,
                    'classroom_name' => $classroom->name,
                    'is_finished' => $order->isFinished(),
                ];
            }),
            'schools' => $schools,
            'filters' => [
                'school_id' => $school_id,
                'classroom_id' => $classroom_id,
            ],
        ]);
    }

    public function print(StickerPrintRequest $request): Response
    {
        $orders = Order::with('classroom.school', 'details.productionStatus', 'products')
            ->whereIn('id', $request->orderIds())
            ->get()
            ->filter(fn (Order $order) => $order->isFinished())
            ->values();

        return Inertia::render('stickers/print', [
            'orders' => StickerResource::collection($orders)->resolve(),
        ]);
    }
}
