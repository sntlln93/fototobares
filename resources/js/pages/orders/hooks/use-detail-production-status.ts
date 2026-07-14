import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useDetailProductionStatus(orderId: number) {
    const setStatus = (detailId: number, statusId: number | null) => {
        router.put(
            route('orders.production-status', { order: orderId }),
            {
                detail_id: detailId,
                production_status_id: statusId,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Estado de fabricación actualizado'),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo actualizar el estado',
                    ),
            },
        );
    };

    return { setStatus };
}
