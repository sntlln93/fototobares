import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type FormData = Pick<
    Combo,
    'name' | 'suggested_price' | 'suggested_max_payments'
> & {
    products: SelectedProduct[];
};

export type SelectedProduct = {
    id: number;
    variants?: Product['variants'];
    notes: string;
};

export function AddProduct({
    addProduct,
    product,
    show,
    onClose,
}: {
    addProduct: (product: SelectedProduct) => void;
    product: Product;
    show: boolean;
    onClose: CallableFunction;
}) {
    const [orientations, setOrientations] = useState<Set<ProductOrientation>>(
        new Set(),
    );
    const [photoTypes, setPhotoTypes] = useState<Set<ProductPhotoType>>(
        new Set(),
    );
    const [backgrounds, setBackgrounds] = useState<Set<string>>(new Set());
    const [colors, setColors] = useState<Set<string>>(new Set());

    const [errors, setErrors] = useState<{
        orientations?: string;
        photoTypes?: string;
        backgrounds?: string;
        colors?: string;
    } | null>(null);

    const handleSetOrientations = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as ProductOrientation;
        const checked = e.target.checked;

        setOrientations((prev) => {
            const newValues = new Set(prev);
            if (checked) {
                newValues.add(value);
            } else {
                newValues.delete(value);
            }
            return newValues;
        });
    };

    const handleSetPhotoTypes = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as ProductPhotoType;
        const checked = e.target.checked;

        setPhotoTypes((prev) => {
            const newValues = new Set(prev);
            if (checked) {
                newValues.add(value);
            } else {
                newValues.delete(value);
            }
            return newValues;
        });
    };

    const handleSetBackgrounds = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checked = e.target.checked;

        setBackgrounds((prev) => {
            const newValues = new Set(prev);
            if (checked) {
                newValues.add(value);
            } else {
                newValues.delete(value);
            }
            return newValues;
        });
    };

    const handleSetColors = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const checked = e.target.checked;

        setColors((prev) => {
            const newValues = new Set(prev);
            if (checked) {
                newValues.add(value);
            } else {
                newValues.delete(value);
            }
            return newValues;
        });
    };

    const handleAddProduct = () => {
        let hasErrors = 0;

        if ([...orientations].length === 0) {
            hasErrors++;
            setErrors((prev) => ({
                ...prev,
                orientations: 'Debes elegir por lo menos una orientación',
            }));
        }

        if ([...photoTypes].length === 0) {
            hasErrors++;
            setErrors((prev) => ({
                ...prev,
                photoTypes: 'Debes elegir por lo menos un tipo de foto',
            }));
        }

        if ([...backgrounds].length === 0) {
            hasErrors++;
            setErrors((prev) => ({
                ...prev,
                backgrounds: 'Debes elegir por lo menos un fondo',
            }));
        }

        if ([...colors].length === 0) {
            hasErrors++;
            setErrors((prev) => ({
                ...prev,
                colors: 'Debes elegir por lo menos un color',
            }));
        }

        if (hasErrors > 0) {
            return;
        }

        const selectedProduct = {
            id: product.id,
            quantity: 1,
            variants: {
                photo_types: Array.from(photoTypes),
                orientations: Array.from(orientations),
                backgrounds: Array.from(backgrounds),
                colors: Array.from(colors),
                dimentions: product.variants.dimentions,
            },
        };

        // addProduct(selectedProduct);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar {product.name} ({product.variants.dimentions}) al
                    combo
                </h2>

                <div className="mt-6">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Orientaciones disponibles para este producto
                        </legend>
                        {product.variants.orientations.map((orientation) => (
                            <label
                                className="flex items-center"
                                key={orientation}
                            >
                                <Checkbox
                                    value={orientation}
                                    checked={orientations.has(orientation)}
                                    onChange={handleSetOrientations}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    {orientation}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <InputError
                        message={errors?.orientations}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tipo de foto
                        </legend>
                        {product.variants.photo_types.map((photoType) => (
                            <label
                                className="flex items-center"
                                key={photoType}
                            >
                                <Checkbox
                                    value={photoType}
                                    checked={photoTypes.has(photoType)}
                                    onChange={handleSetPhotoTypes}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    {photoType}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <InputError message={errors?.photoTypes} className="mt-2" />
                </div>

                <div className="mt-6">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fondos disponibles para este combo
                        </legend>
                        {product.variants.backgrounds.map((background) => (
                            <label
                                className="flex items-center"
                                key={background}
                            >
                                <Checkbox
                                    value={background}
                                    checked={backgrounds.has(background)}
                                    onChange={handleSetBackgrounds}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    {background}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <InputError
                        message={errors?.backgrounds}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Colores disponibles para este combo
                        </legend>
                        {product.variants.colors.map((color) => (
                            <label className="flex items-center" key={color}>
                                <Checkbox
                                    value={color}
                                    checked={colors.has(color)}
                                    onChange={handleSetColors}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    {color}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                    <InputError message={errors?.colors} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => onClose()}>
                        Cancelar
                    </Button>

                    <Button className="ms-3" onClick={handleAddProduct}>
                        Agregar {product.name}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
