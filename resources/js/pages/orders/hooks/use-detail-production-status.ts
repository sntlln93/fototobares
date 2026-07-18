import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function useDetailProductionStatus(orderId: number) {
    const requestOptions = (successMessage: string) => ({
        preserveScroll: true as const,
        onSuccess: () => toast.success(successMessage),
        onError: (errors: Record<string, string>) =>
            toast.error(
                Object.values(errors)[0] ?? 'No se pudo actualizar el estado',
            ),
    });

    const setStatus = (detailId: number, statusId: number | null) => {
        router.put(
            route('orders.production-status', { order: orderId }),
            {
                detail_id: detailId,
                production_status_id: statusId,
            },
            requestOptions('Estado de fabricación actualizado'),
        );
    };

    const disableProduction = (detailId: number) => {
        router.put(
            route('orders.production-status', { order: orderId }),
            {
                detail_id: detailId,
                disable_production: true,
            },
            requestOptions('Fabricación deshabilitada'),
        );
    };

    return { setStatus, disableProduction };
}
