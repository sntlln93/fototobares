import { InertiaFormProps } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductOrder } from '../form';
import { OrderFormData, removeDetailAt, replaceDetailAt } from '../form-state';

interface UseOrderProductsParams {
    data: OrderFormData;
    setData: InertiaFormProps<OrderFormData>['setData'];
    products: Product[];
    combos: Array<Combo & { products: Product[] }>;
}

/**
 * Cart management for the order form: the add/edit modal state plus the
 * handlers that mutate `order_details`. Kept apart from the form itself so
 * neither hook grows past the size limits.
 */
export function useOrderProducts({
    data,
    setData,
    products,
    combos,
}: UseOrderProductsParams) {
    const [openAddModal, setOpenAddModal] = useState<
        (Product & { combo_id?: number })[] | null
    >(null);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddProduct = (id: number) => {
        setOpenAddModal([products.find((p) => p.id === id)!]);
    };

    const handleAddCombo = (id: number) => {
        const combo = combos.find((p) => p.id === id)!;

        setData(
            'total_price',
            String(Number(data.total_price) + Number(combo.suggested_price)),
        );

        // The first combo of the order seeds the installments; a second one
        // must not overwrite the number the seller already agreed on
        const hasCombo = data.order_details.some(
            (detail) => detail.combo_id !== undefined,
        );

        if (!hasCombo) {
            setData('payment_plan', String(combo.default_payments));
        }

        setOpenAddModal(combo.products.map((p) => ({ ...p, combo_id: id })));
    };

    const setProductsOrder = (productsOrder: ProductOrder[]) => {
        if (editingIndex !== null) {
            setData(
                'order_details',
                replaceDetailAt(
                    data.order_details,
                    editingIndex,
                    productsOrder,
                ),
            );
            setEditingIndex(null);
            return;
        }

        setData('order_details', [...data.order_details, ...productsOrder]);
    };

    const handleEditProduct = (index: number) => {
        const selected = data.order_details[index];
        // Combo items must keep the pivot-restricted variants, not the
        // full catalog ones
        const combo =
            selected.combo_id !== undefined
                ? combos.find((c) => c.id === selected.combo_id)
                : undefined;
        const product =
            combo?.products.find((p) => p.id === selected.product_id) ??
            products.find((p) => p.id === selected.product_id);

        if (!product) return;

        setEditingIndex(index);
        setOpenAddModal([{ ...product, combo_id: selected.combo_id }]);
    };

    const handleRemoveProduct = (index: number) => {
        setData('order_details', removeDetailAt(data.order_details, index));
        toast.info('Producto quitado. Recordá revisar el precio final.');
    };

    return {
        openAddModal,
        setOpenAddModal,
        editingIndex,
        setEditingIndex,
        handleAddProduct,
        handleAddCombo,
        setProductsOrder,
        handleEditProduct,
        handleRemoveProduct,
    };
}
