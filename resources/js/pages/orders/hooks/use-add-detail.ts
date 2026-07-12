import { useState } from 'react';
import {
    DetailFormData,
    DetailFormErrors,
    buildProductOrders,
    initialDetailFormData,
    resolveVariants,
    validateDetailForm,
} from '../detail-form';
import { ProductOrder, SelectableProduct } from '../form';

interface UseAddDetailParams {
    products: SelectableProduct[];
    addProducts: (products: ProductOrder[]) => void;
    onClose: () => void;
    initialValues?: ProductOrder[];
}

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

    const getProductValue = <K extends keyof typeof productData>(
        productId: number,
        key: K,
    ) => productData[key].find((item) => item.product_id === productId)?.value;

    const updateProductData = <K extends keyof typeof productData>(
        key: K,
        productId: number,
        value: (typeof productData)[K][number]['value'],
    ) => {
        setProductData((prev) => {
            const exists = prev[key].some(
                (item) => item.product_id === productId,
            );

            const updatedData = {
                ...prev,
                [key]: exists
                    ? prev[key].map((item) =>
                          item.product_id === productId
                              ? { ...item, value }
                              : item,
                      )
                    : [...prev[key], { product_id: productId, value }],
            };

            // Reset error if the new value is non-falsy
            if (value) {
                setErrors((prevErrors) => {
                    if (!prevErrors[productId]) return prevErrors;

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [key]: _, ...remainingErrors } =
                        prevErrors[productId];

                    return Object.keys(remainingErrors).length > 0
                        ? { ...prevErrors, [productId]: remainingErrors }
                        : Object.fromEntries(
                              Object.entries(prevErrors).filter(
                                  ([id]) => Number(id) !== productId,
                              ),
                          );
                });
            }

            return updatedData;
        });
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

    const getVariants = (step: typeof currentStep) =>
        resolveVariants(products[step]);

    return {
        errors,
        currentStep,
        getProductValue,
        updateProductData,
        handleAddProduct,
        handleNextStep,
        handlePreviousStep,
        getVariants,
    };
}
