<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreNoteRequest;
use App\Models\Note;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;

class NoteController extends Controller
{
    public function store(StoreNoteRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var int $orderId */
        $orderId = $validated['order_id'];

        $order = Order::findOrFail($orderId);
        $order->notes()->create(['body' => $validated['body']]);

        return redirect()->route('orders.show', ['order' => $order->id])->with('message', 'Nota agregada exitosamente.');
    }

    public function destroy(Note $note): RedirectResponse
    {
        $orderId = $note->order_id;

        $note->delete();

        return redirect()->route('orders.show', ['order' => $orderId])->with('message', 'Nota eliminada exitosamente.');
    }
}
