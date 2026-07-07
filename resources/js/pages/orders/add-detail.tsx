import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalize, getColorEs } from '@/lib/utils';
import { useState } from 'react';
import {
    DetailFormData,
    DetailFormErrors,
    buildProductOrders,
    initialDetailFormData,
    resolveVariants,
    validateDetailForm,
} from './detail-form';
import { ProductOrder, SelectableProduct } from './form';

export function AddDetail({
    addProducts,
    products,
    show,
    onClose,
    initialValues,
}: {
    addProducts: (products: ProductOrder[]) => void;
    products: SelectableProduct[];
    show: boolean;
    onClose: CallableFunction;
    /** Existing values (aligned with `products`) when editing an added product */
    initialValues?: ProductOrder[];
}) {
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

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6" key={products[currentStep].id}>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar {products[currentStep].name} al pedido
                </h2>

                <h3 className="text-md font-medium text-gray-500 dark:text-gray-100">
                    Agregando {currentStep + 1} de {products.length} productos
                </h3>

                {products[currentStep].product_type_id === 1 ? (
                    <>
                        <div className="mt-2">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Orientaciones disponibles para este producto
                                </legend>
                                <div className="mt-1 flex flex-wrap gap-4">
                                    {getVariants(currentStep).orientations.map(
                                        (orientation) => (
                                            <label
                                                className="flex items-center"
                                                key={orientation}
                                            >
                                                <Checkbox
                                                    value={orientation}
                                                    checked={
                                                        getProductValue(
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            'orientation',
                                                        ) === orientation
                                                    }
                                                    onChange={(e) =>
                                                        updateProductData(
                                                            'orientation',
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            e.target
                                                                .value as ProductOrientation,
                                                        )
                                                    }
                                                />
                                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {capitalize(orientation)}
                                                </span>
                                            </label>
                                        ),
                                    )}
                                </div>
                            </fieldset>
                            <InputError
                                message={
                                    errors[products[currentStep].id]
                                        ?.orientation
                                }
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipo de foto
                                </legend>
                                <div className="mt-1 flex flex-wrap gap-4">
                                    {getVariants(currentStep).photo_types.map(
                                        (photoType) => (
                                            <label
                                                className="flex items-center"
                                                key={photoType}
                                            >
                                                <Checkbox
                                                    value={photoType}
                                                    checked={
                                                        getProductValue(
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            'photoType',
                                                        ) === photoType
                                                    }
                                                    onChange={(e) =>
                                                        updateProductData(
                                                            'photoType',
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            e.target
                                                                .value as ProductPhotoType,
                                                        )
                                                    }
                                                />
                                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {capitalize(photoType)}
                                                </span>
                                            </label>
                                        ),
                                    )}
                                </div>
                            </fieldset>
                            <InputError
                                message={
                                    errors[products[currentStep].id]?.photoType
                                }
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Fondos disponibles para este producto en
                                    este combo
                                </legend>
                                <div className="mt-1 flex flex-wrap gap-4">
                                    {getVariants(currentStep).backgrounds.map(
                                        (background) => (
                                            <label
                                                className="flex items-center"
                                                key={background}
                                            >
                                                <Checkbox
                                                    value={background}
                                                    checked={
                                                        getProductValue(
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            'background',
                                                        ) === background
                                                    }
                                                    onChange={(e) =>
                                                        updateProductData(
                                                            'background',
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {getColorEs(background)}
                                                </span>
                                            </label>
                                        ),
                                    )}
                                </div>
                            </fieldset>
                            <InputError
                                message={
                                    errors[products[currentStep].id]?.background
                                }
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Colores disponibles para este producto en
                                    este combo
                                </legend>
                                <div className="mt-1 flex flex-wrap gap-4">
                                    {getVariants(currentStep).colors.map(
                                        (color) => (
                                            <label
                                                className="flex items-center"
                                                key={color}
                                            >
                                                <Checkbox
                                                    value={color}
                                                    checked={
                                                        getProductValue(
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            'color',
                                                        ) === color
                                                    }
                                                    onChange={(e) =>
                                                        updateProductData(
                                                            'color',
                                                            products[
                                                                currentStep
                                                            ].id,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {getColorEs(color)}
                                                </span>
                                            </label>
                                        ),
                                    )}
                                </div>
                            </fieldset>
                            <InputError
                                message={
                                    errors[products[currentStep].id]?.color
                                }
                                className="mt-2"
                            />
                        </div>
                    </>
                ) : undefined}

                <div className="mt-2">
                    <Label htmlFor="note">Notas</Label>
                    <InputHint
                        className="text-xs"
                        message="Nombre que va en la foto u otra información que deba estar impresa en este producto"
                    />

                    <Input
                        id="note"
                        type="text"
                        name="note"
                        value={
                            getProductValue(products[currentStep].id, 'note') ??
                            ''
                        }
                        onChange={(e) =>
                            updateProductData(
                                'note',
                                products[currentStep].id,
                                e.target.value,
                            )
                        }
                        className="mt-1 block w-full"
                    />
                    <InputError
                        message={errors[products[currentStep].id]?.note}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    {currentStep > 0 ? (
                        <Button
                            variant="secondary"
                            onClick={handlePreviousStep}
                        >
                            Atrás
                        </Button>
                    ) : undefined}

                    <Button variant="outline" onClick={() => onClose()}>
                        Cancelar
                    </Button>

                    {currentStep === products.length - 1 ? (
                        <Button onClick={handleAddProduct}>
                            Agregar {products.length} producto
                            {products.length > 1 ? 's' : ''} al pedido
                        </Button>
                    ) : (
                        <Button onClick={handleNextStep}>Siguiente</Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
