<?php

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create()
    {
        $schools = School::with(['classrooms.teacher', 'principal'])->get();
        $combos = Combo::with(['products'])->get();

        return Inertia::render('orders/create', [
            'schools' => $schools,
            'combos' => $combos,
        ]);
    }
}
