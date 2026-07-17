import { router } from '@inertiajs/react';
import { toast } from 'sonner';

/**
 * Per-row editing status transition, reusing the existing
 * `/order-details/{orderDetail}/editing-status` endpoint (#176). The set of
 * legal targets is computed server-side per row (`allowed_targets`).
 */
export function useEditingStatusTransition() {
    const transition = (orderDetailId: number, status: string) => {
        router.post(
            route('editing-status.store', { orderDetail: orderDetailId }),
            { status },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Estado de edición actualizado'),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo actualizar el estado',
                    ),
            },
        );
    };

    const revert = (orderDetailId: number) => {
        router.post(
            route('editing-status.revert', { orderDetail: orderDetailId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Transición revertida'),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo revertir la transición',
                    ),
            },
        );
    };

    return { transition, revert };
}
