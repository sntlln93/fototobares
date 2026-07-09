import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export type StatusRow = ProductionStatus & { details_count: number };
export type ProductTypeRow = ProductType & { statuses: StatusRow[] };

const onError = (errors: Record<string, string>) =>
    toast.error(Object.values(errors)[0] ?? 'No se pudo guardar el cambio');

/**
 * Mutations for the stages of one product type.
 */
export function useStatusActions(type: ProductTypeRow) {
    const move = (index: number, direction: -1 | 1) => {
        const orderedIds = type.statuses.map((status) => status.id);
        const target = index + direction;

        [orderedIds[index], orderedIds[target]] = [
            orderedIds[target],
            orderedIds[index],
        ];

        router.put(
            route('production-statuses.reorder'),
            { product_type_id: type.id, ordered_ids: orderedIds },
            { preserveScroll: true, onError },
        );
    };

    const rename = (statusId: number, name: string, onSuccess: () => void) => {
        router.put(
            route('production-statuses.update', { productionStatus: statusId }),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Etapa renombrada');
                    onSuccess();
                },
                onError,
            },
        );
    };

    const add = (name: string, onSuccess: () => void) => {
        router.post(
            route('production-statuses.store'),
            { product_type_id: type.id, name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Etapa "${name}" agregada`);
                    onSuccess();
                },
                onError,
            },
        );
    };

    return { move, rename, add };
}
