import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useDelivery(order: Order) {
    const [selected, setSelected] = useState<number[]>([]);
    const [pendingDelivery, setPendingDelivery] = useState<number[] | null>(
        null,
    );

    const products = order.products.filter((product) => !product.recycled_to);
    const undelivered = products.filter((product) => !product.delivered_at);
    const delivered = products.filter((product) => product.delivered_at);

    const balance = order.balance ?? 0;

    const toggle = (detailId: number) => {
        setSelected((prev) =>
            prev.includes(detailId)
                ? prev.filter((id) => id !== detailId)
                : [...prev, detailId],
        );
    };

    const deliver = (detailIds: number[]) => {
        router.put(
            route('orders.delivery', { order: order.id }),
            {
                detail_ids: detailIds,
                action: 'deliver',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    setPendingDelivery(null);
                    toast.success('Entrega registrada');
                },
                onError: () => toast.error('No se pudo registrar la entrega'),
            },
        );
    };

    const requestDelivery = (detailIds: number[]) => {
        if (detailIds.length === 0) {
            toast.error('Seleccioná al menos un producto para entregar');
            return;
        }

        if (balance > 0) {
            // Ignorable warning: the client asked to be able to deliver anyway
            setPendingDelivery(detailIds);
            return;
        }

        deliver(detailIds);
    };

    const undo = (detailId: number) => {
        router.put(
            route('orders.delivery', { order: order.id }),
            {
                detail_ids: [detailId],
                action: 'undeliver',
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Entrega deshecha'),
            },
        );
    };

    return {
        selected,
        pendingDelivery,
        setPendingDelivery,
        undelivered,
        delivered,
        balance,
        toggle,
        deliver,
        requestDelivery,
        undo,
    };
}
