import { InertiaFormProps } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ComboWithProducts, ProductOrder } from '../form';
import { OrderFormData, removeDetailAt, replaceDetailAt } from '../form-state';
import { computeTotal, priceBreakdown } from '../pricing';

interface UseOrderProductsParams {
    data: OrderFormData;
    setData: InertiaFormProps<OrderFormData>['setData'];
    products: Product[];
    combos: ComboWithProducts[];
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

    const breakdown = priceBreakdown(data.order_details, combos, products);

    const comboOf = (details: ProductOrder[]) =>
        details.find((detail) => detail.combo_id !== undefined)?.combo_id;

    /**
     * The single door to the cart: the total is always recomputed from the
     * details, never accumulated over the previous one. A price typed by hand
     * therefore survives only until the cart changes again.
     */
    const applyDetails = (details: ProductOrder[]) => {
        const seedsPayments =
            comboOf(data.order_details) === undefined &&
            comboOf(details) !== undefined;

        const firstCombo = combos.find(
            (combo) => combo.id === comboOf(details),
        );

        setData((current) => ({
            ...current,
            order_details: details,
            total_price: String(computeTotal(details, combos, products)),
            payment_plan:
                seedsPayments && firstCombo
                    ? String(firstCombo.default_payments)
                    : current.payment_plan,
        }));
    };

    const handleAddProduct = (id: number) => {
        setOpenAddModal([products.find((p) => p.id === id)!]);
    };

    /**
     * The combo only enters the cart once its products are configured, so
     * cancelling the modal leaves the price untouched.
     */
    const handleAddCombo = (id: number) => {
        const combo = combos.find((p) => p.id === id)!;

        setOpenAddModal(combo.products.map((p) => ({ ...p, combo_id: id })));
    };

    const setProductsOrder = (productsOrder: ProductOrder[]) => {
        if (editingIndex !== null) {
            applyDetails(
                replaceDetailAt(
                    data.order_details,
                    editingIndex,
                    productsOrder,
                ),
            );
            setEditingIndex(null);
            return;
        }

        applyDetails([...data.order_details, ...productsOrder]);
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
        applyDetails(removeDetailAt(data.order_details, index));
        toast.info('Producto quitado. Se recalculó el precio.');
    };

    const recalculatePrice = () => {
        setData('total_price', String(breakdown.total));
    };

    return {
        openAddModal,
        setOpenAddModal,
        editingIndex,
        setEditingIndex,
        breakdown,
        handleAddProduct,
        handleAddCombo,
        setProductsOrder,
        handleEditProduct,
        handleRemoveProduct,
        recalculatePrice,
    };
}
