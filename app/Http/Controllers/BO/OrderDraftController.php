<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Orders\CreateOrderDraft;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreOrderDraftRequest;
use App\Http\Resources\OrderDraftResource;
use App\Models\OrderDraft;
use Illuminate\Http\RedirectResponse;
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

    public function store(StoreOrderDraftRequest $request, CreateOrderDraft $action): RedirectResponse
    {
        $action->handle($request->validated());

        return back()->with('success', 'Borrador guardado exitosamente');
    }

    public function destroy(OrderDraft $draft): RedirectResponse
    {
        $draft->delete();

        return back()->with('success', 'Borrador eliminado');
    }
}
