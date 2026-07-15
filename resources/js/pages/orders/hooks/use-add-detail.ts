import { resolveVariantDefinitions } from '@/lib/variants';
import { useState } from 'react';
import {
    DetailFormData,
    DetailFormErrors,
    buildProductOrders,
    initialDetailFormData,
    validateDetailForm,
} from '../detail-form';
import { ProductOrder, SelectableProduct } from '../form';

interface UseAddDetailParams {
    products: SelectableProduct[];
    addProducts: (products: ProductOrder[]) => void;
    onClose: () => void;
    initialValues?: ProductOrder[];
}

const clearProductError = (
    errors: DetailFormErrors,
    productId: number,
    key: string,
): DetailFormErrors => {
    if (!errors[productId]?.[key]) {
        return errors;
    }

    const remaining = { ...errors[productId] };
    delete remaining[key];

    return Object.keys(remaining).length > 0
        ? { ...errors, [productId]: remaining }
        : Object.fromEntries(
              Object.entries(errors).filter(([id]) => Number(id) !== productId),
          );
};

export function useAddDetail({
    products,
    addProducts,
    onClose,
    initialValues,
}: UseAddDetailParams) {
    const [productData, setProductData] = useState<DetailFormData>(() =>
        initialDetailFormData(initialValues),
    );

    const [errors, setErrors] = useState<DetailFormErrors>({});

    const [currentStep, setCurrentStep] = useState<number>(0);

    const getVariantValue = (productId: number, label: string) =>
        productData[productId]?.values[label] ?? null;

    const setVariantValue = (
        productId: number,
        label: string,
        value: string | null,
    ) => {
        setProductData((prev) => ({
            ...prev,
            [productId]: {
                values: { ...prev[productId]?.values, [label]: value },
                note: prev[productId]?.note ?? '',
            },
        }));

        if (value) {
            setErrors((prev) => clearProductError(prev, productId, label));
        }
    };

    const getNote = (productId: number) => productData[productId]?.note ?? '';

    const setNote = (productId: number, note: string) => {
        setProductData((prev) => ({
            ...prev,
            [productId]: { values: prev[productId]?.values ?? {}, note },
        }));

        if (note) {
            setErrors((prev) => clearProductError(prev, productId, 'note'));
        }
    };

    const handleAddProduct = () => {
        const newErrors = validateDetailForm(products, productData);

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        addProducts(buildProductOrders(products, productData));
        onClose();
    };

    const handleNextStep = () => {
        if (currentStep < products.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getDefinitions = (step: typeof currentStep) =>
        resolveVariantDefinitions(products[step]);

    return {
        errors,
        currentStep,
        getVariantValue,
        setVariantValue,
        getNote,
        setNote,
        handleAddProduct,
        handleNextStep,
        handlePreviousStep,
        getDefinitions,
    };
}
