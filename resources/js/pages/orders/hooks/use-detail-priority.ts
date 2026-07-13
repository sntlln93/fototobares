import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useDetailPriority(orderId: number) {
    const toggle = (detailId: number, priority: boolean) => {
        router.put(
            route('orders.priority', { order: orderId }),
            {
                detail_id: detailId,
                priority,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        priority
                            ? 'Producto marcado como prioritario'
                            : 'Prioridad quitada',
                    ),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo cambiar la prioridad',
                    ),
            },
        );
    };

    return { toggle };
}
