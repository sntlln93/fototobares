import { router } from '@inertiajs/react';
import { toast } from 'sonner';

/**
 * Individual editor assignment for a single order detail row, reusing the
 * existing `/editor-assignments` write endpoints (#175).
 */
export function useEditorAssignment() {
    const assign = (orderDetailId: number, editorId: number) => {
        router.post(
            route('editor-assignments.store'),
            { order_detail_id: orderDetailId, editor_id: editorId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Editor asignado'),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo asignar el editor',
                    ),
            },
        );
    };

    const unassign = (orderDetailId: number) => {
        router.delete(
            route('editor-assignments.destroy', { orderDetail: orderDetailId }),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Editor desasignado'),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo desasignar el editor',
                    ),
            },
        );
    };

    return { assign, unassign };
}
