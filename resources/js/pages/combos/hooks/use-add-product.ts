import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { SelectedProduct } from '../form';

interface VariantErrors {
    orientations?: string;
    photoTypes?: string;
    backgrounds?: string;
    colors?: string;
}

interface UseAddProductParams {
    product: Product;
    initialVariants?: SelectedProduct['variants'] | null;
    addProduct: (product: SelectedProduct) => void;
    onClose: () => void;
}

function toggleInSet<T extends string>(
    setter: Dispatch<SetStateAction<Set<T>>>,
) {
    return (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as T;
        const checked = e.target.checked;

        setter((prev) => {
            const newValues = new Set(prev);
            if (checked) {
                newValues.add(value);
            } else {
                newValues.delete(value);
            }
            return newValues;
        });
    };
}

export function useAddProduct({
    product,
    initialVariants,
    addProduct,
    onClose,
}: UseAddProductParams) {
    const [orientations, setOrientations] = useState<Set<ProductOrientation>>(
        new Set(initialVariants?.orientations ?? []),
    );
    const [photoTypes, setPhotoTypes] = useState<Set<ProductPhotoType>>(
        new Set(initialVariants?.photo_types ?? []),
    );
    const [backgrounds, setBackgrounds] = useState<Set<string>>(
        new Set(initialVariants?.backgrounds ?? []),
    );
    const [colors, setColors] = useState<Set<Color>>(
        new Set(initialVariants?.colors ?? []),
    );

    const [errors, setErrors] = useState<VariantErrors | null>(null);

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
            // Kept by upsertSelectedProduct when editing an existing product
            subtract_value: 0,
            variants: {
                photo_types: Array.from(photoTypes),
                orientations: Array.from(orientations),
                backgrounds: Array.from(backgrounds),
                colors: Array.from(colors) as Color[],
                dimentions: product.variants?.dimentions ?? '',
            },
        };

        addProduct(selectedProduct);
        onClose();
    };

    return {
        orientations,
        photoTypes,
        backgrounds,
        colors,
        errors,
        handleSetOrientations: toggleInSet(setOrientations),
        handleSetPhotoTypes: toggleInSet(setPhotoTypes),
        handleSetBackgrounds: toggleInSet(setBackgrounds),
        handleSetColors: toggleInSet(setColors),
        handleAddProduct,
    };
}
