import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export type StageStockable = {
    id: number;
    name: string;
    unit: string;
    quantity: number;
};

export type StatusRow = ProductionStatus & {
    details_count: number;
    stockables: StageStockable[];
};

export type ProductStagesRow = {
    id: number;
    name: string;
    type: string | null;
    statuses: StatusRow[];
};

export type StockableOption = { id: number; name: string; unit: string };

const onError = (errors: Record<string, string>) =>
    toast.error(Object.values(errors)[0] ?? 'No se pudo guardar el cambio');

/**
 * Mutations for the production chain of one product.
 */
export function useStatusActions(product: ProductStagesRow) {
    const move = (index: number, direction: -1 | 1) => {
        const orderedIds = product.statuses.map((status) => status.id);
        const target = index + direction;

        [orderedIds[index], orderedIds[target]] = [
            orderedIds[target],
            orderedIds[index],
        ];

        router.put(
            route('production-statuses.reorder'),
            { product_id: product.id, ordered_ids: orderedIds },
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
            { product_id: product.id, name },
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

    const attachStockable = (
        statusId: number,
        stockableId: number,
        quantity: number,
        onSuccess?: () => void,
    ) => {
        router.post(
            route('production-statuses.stockables.store', {
                productionStatus: statusId,
            }),
            { stockable_id: stockableId, quantity },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Consumo de insumo guardado');
                    onSuccess?.();
                },
                onError,
            },
        );
    };

    const detachStockable = (statusId: number, stockableId: number) => {
        router.delete(
            route('production-statuses.stockables.destroy', {
                productionStatus: statusId,
                stockable: stockableId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Consumo de insumo quitado'),
                onError,
            },
        );
    };

    return { move, rename, add, attachStockable, detachStockable };
}
