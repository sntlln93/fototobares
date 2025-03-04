import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type ProductOrder = {
    variant?: {
        orientation: ProductOrientation;
        photoType: ProductPhotoType;
        background: string;
        color: string;
    };
    product_id: number;
    note: string;
};

type ProductData<T> = { product_id: number; value: T };

export function AddDetail({
    addProducts,
    products,
    show,
    onClose,
}: {
    addProducts: (products: ProductOrder[]) => void;
    products: Product[];
    show: boolean;
    onClose: CallableFunction;
}) {
    const [productData, setProductData] = useState<{
        orientation: ProductData<ProductOrientation>[];
        photoType: ProductData<ProductPhotoType>[];
        background: ProductData<string>[];
        color: ProductData<string>[];
        note: ProductData<string>[];
    }>({
        orientation: [],
        photoType: [],
        background: [],
        color: [],
        note: [],
    });

    const [errors, setErrors] = useState<{
        [productId: number]: {
            orientation?: string;
            photoType?: string;
            background?: string;
            color?: string;
            note?: string;
        };
    }>({});

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
        const newErrors: {
            [productId: number]: Partial<
                Record<keyof typeof productData, string>
            >;
        } = {};
        let hasErrors = 0;

        products.forEach((product) => {
            const productId = product.id;

            const productErrors: Partial<
                Record<keyof typeof productData, string>
            > = {};

            if (
                !productData.orientation.some(
                    (item) => item.product_id === productId,
                )
            ) {
                productErrors.orientation = 'Debes elegir una opción';
            }

            if (
                !productData.photoType.some(
                    (item) => item.product_id === productId,
                )
            ) {
                productErrors.photoType = 'Debes elegir una opción';
            }

            if (
                !productData.background.some(
                    (item) => item.product_id === productId,
                )
            ) {
                productErrors.background = 'Debes elegir una opción';
            }

            if (
                !productData.color.some((item) => item.product_id === productId)
            ) {
                productErrors.color = 'Debes elegir una opción';
            }

            if (
                product.type === 'mural' &&
                !productData.note.some((item) => item.product_id === productId)
            ) {
                productErrors.note =
                    'Este campo es requerido cuando el producto es un mural';
            }

            if (Object.keys(productErrors).length > 0) {
                newErrors[productId] = productErrors;
                hasErrors++;
            }
        });

        setErrors(newErrors);

        if (hasErrors > 0) {
            return;
        }

        // Transform `productData` into `ProductOrder[]`
        const productOrders: ProductOrder[] = products.map((product) => ({
            product_id: product.id,
            variant: {
                orientation: productData.orientation.find(
                    (item) => item.product_id === product.id,
                )!.value!,
                photoType: productData.photoType.find(
                    (item) => item.product_id === product.id,
                )!.value!,
                background: productData.background.find(
                    (item) => item.product_id === product.id,
                )!.value!,
                color: productData.color.find(
                    (item) => item.product_id === product.id,
                )!.value!,
            },
            note:
                productData.note.find((item) => item.product_id === product.id)
                    ?.value || '',
        }));

        addProducts(productOrders);
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

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6" key={products[currentStep].id}>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar {products.length} producto
                    {products.length > 1 ? 's' : undefined} al pedido
                </h2>

                <h3 className="text-md font-medium text-gray-500 dark:text-gray-100">
                    {currentStep + 1} de {products.length}
                </h3>

                <div className="mt-2">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Orientaciones disponibles para este producto
                        </legend>
                        <div className="mt-1 flex flex-wrap gap-4">
                            {products[currentStep].variants.orientations.map(
                                (orientation) => (
                                    <label
                                        className="flex items-center"
                                        key={orientation}
                                    >
                                        <Checkbox
                                            value={orientation}
                                            checked={
                                                getProductValue(
                                                    products[currentStep].id,
                                                    'orientation',
                                                ) === orientation
                                            }
                                            onChange={(e) =>
                                                updateProductData(
                                                    'orientation',
                                                    products[currentStep].id,
                                                    e.target
                                                        .value as ProductOrientation,
                                                )
                                            }
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {orientation}
                                        </span>
                                    </label>
                                ),
                            )}
                        </div>
                    </fieldset>
                    <InputError
                        message={errors[products[currentStep].id]?.orientation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-2">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tipo de foto
                        </legend>
                        <div className="mt-1 flex flex-wrap gap-4">
                            {products[currentStep].variants.photo_types.map(
                                (photoType) => (
                                    <label
                                        className="flex items-center"
                                        key={photoType}
                                    >
                                        <Checkbox
                                            value={photoType}
                                            checked={
                                                getProductValue(
                                                    products[currentStep].id,
                                                    'photoType',
                                                ) === photoType
                                            }
                                            onChange={(e) =>
                                                updateProductData(
                                                    'photoType',
                                                    products[currentStep].id,
                                                    e.target
                                                        .value as ProductPhotoType,
                                                )
                                            }
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {photoType}
                                        </span>
                                    </label>
                                ),
                            )}
                        </div>
                    </fieldset>
                    <InputError
                        message={errors[products[currentStep].id]?.photoType}
                        className="mt-2"
                    />
                </div>

                <div className="mt-2">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fondos disponibles para este combo
                        </legend>
                        <div className="mt-1 flex flex-wrap gap-4">
                            {products[currentStep].variants.backgrounds.map(
                                (background) => (
                                    <label
                                        className="flex items-center"
                                        key={background}
                                    >
                                        <Checkbox
                                            value={background}
                                            checked={
                                                getProductValue(
                                                    products[currentStep].id,
                                                    'background',
                                                ) === background
                                            }
                                            onChange={(e) =>
                                                updateProductData(
                                                    'background',
                                                    products[currentStep].id,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {background}
                                        </span>
                                    </label>
                                ),
                            )}
                        </div>
                    </fieldset>
                    <InputError
                        message={errors[products[currentStep].id]?.background}
                        className="mt-2"
                    />
                </div>

                <div className="mt-2">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Colores disponibles para este combo
                        </legend>
                        <div className="mt-1 flex flex-wrap gap-4">
                            {products[currentStep].variants.colors.map(
                                (color) => (
                                    <label
                                        className="flex items-center"
                                        key={color}
                                    >
                                        <Checkbox
                                            value={color}
                                            checked={
                                                getProductValue(
                                                    products[currentStep].id,
                                                    'color',
                                                ) === color
                                            }
                                            onChange={(e) =>
                                                updateProductData(
                                                    'color',
                                                    products[currentStep].id,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {color}
                                        </span>
                                    </label>
                                ),
                            )}
                        </div>
                    </fieldset>
                    <InputError
                        message={errors[products[currentStep].id]?.color}
                        className="mt-2"
                    />
                </div>

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
                            Agregar {products.length} productos al pedido
                        </Button>
                    ) : (
                        <Button onClick={handleNextStep}>Siguiente</Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
