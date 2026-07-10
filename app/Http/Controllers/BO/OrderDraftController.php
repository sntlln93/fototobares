<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderDraftResource;
use App\Models\OrderDraft;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderDraftController extends Controller
{
    public function index(): Response
    {
        $drafts = OrderDraft::with('classroom.school', 'classroom.teacher')
            ->latest()
            ->paginate(20);

        return Inertia::render('drafts/index', [
            'drafts' => OrderDraftResource::collection($drafts),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'classroom_id' => ['required', 'exists:classrooms,id'],
            'child_name' => ['nullable', 'string'],
            'client_name' => ['nullable', 'string'],
            'client_phone' => ['nullable', 'string'],
            'attended_photo_session' => ['nullable', 'boolean'],
            'total_price' => ['nullable', 'numeric'],
            'payment_plan' => ['nullable', 'numeric'],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'products' => ['nullable', 'array'],
        ]);

        OrderDraft::create($validated);

        return back()->with('success', 'Borrador guardado exitosamente');
    }

    public function destroy(OrderDraft $draft): RedirectResponse
    {
        $draft->delete();

        return back()->with('success', 'Borrador eliminado');
    }
}
