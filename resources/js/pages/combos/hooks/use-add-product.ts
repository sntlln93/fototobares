import { ChangeEvent, useState } from 'react';
import { SelectedProduct } from '../form';

interface UseAddProductParams {
    product: Product;
    initialVariants?: SelectedProduct['variants'] | null;
    addProduct: (product: SelectedProduct) => void;
    onClose: () => void;
}

/**
 * Defaults to every option selected (no restriction) rather than empty:
 * friendlier than forcing the user to re-check every option just to leave
 * the product unrestricted.
 */
const initialSelection = (
    product: Product,
    initialVariants?: ComboVariantSubset | null,
): Record<string, Set<string>> =>
    Object.fromEntries(
        (product.variants ?? []).map((definition) => [
            definition.label,
            new Set(
                initialVariants?.[definition.label] ??
                    definition.options.map((option) => option.label),
            ),
        ]),
    );

export function useAddProduct({
    product,
    initialVariants,
    addProduct,
    onClose,
}: UseAddProductParams) {
    const [selection, setSelection] = useState<Record<string, Set<string>>>(
        () => initialSelection(product, initialVariants),
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const toggleOption =
        (label: string) => (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const checked = e.target.checked;

            setSelection((prev) => {
                const next = new Set(prev[label]);

                if (checked) {
                    next.add(value);
                } else {
                    next.delete(value);
                }

                return { ...prev, [label]: next };
            });
        };

    const handleAddProduct = () => {
        const newErrors: Record<string, string> = {};

        (product.variants ?? []).forEach((definition) => {
            if ((selection[definition.label]?.size ?? 0) === 0) {
                newErrors[definition.label] =
                    `Debes elegir por lo menos una opción de "${definition.label}"`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            return;
        }

        const selectedProduct: SelectedProduct = {
            id: product.id,
            quantity: 1,
            // Kept by upsertSelectedProduct when editing an existing product
            subtract_value: 0,
            variants: Object.fromEntries(
                Object.entries(selection).map(([label, options]) => [
                    label,
                    Array.from(options),
                ]),
            ),
        };

        addProduct(selectedProduct);
        onClose();
    };

    return { selection, errors, toggleOption, handleAddProduct };
}
