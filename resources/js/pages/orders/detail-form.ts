import { ProductOrder, SelectableProduct } from './form';

export const MURAL_PRODUCT_TYPE_ID = 1;

export type ProductData<T> = { product_id: number; value: T };

export type DetailFormData = {
    orientation: ProductData<ProductOrientation>[];
    photoType: ProductData<ProductPhotoType>[];
    background: ProductData<string>[];
    color: ProductData<string>[];
    note: ProductData<string>[];
};

export type DetailFormErrors = {
    [productId: number]: Partial<Record<keyof DetailFormData, string>>;
};

/**
 * Builds the modal state from existing values when editing an added product.
 */
export const initialDetailFormData = (
    initialValues?: ProductOrder[],
): DetailFormData => {
    const initial: DetailFormData = {
        orientation: [],
        photoType: [],
        background: [],
        color: [],
        note: [],
    };

    initialValues?.forEach((value) => {
        if (value.variant) {
            initial.orientation.push({
                product_id: value.product_id,
                value: value.variant.orientation,
            });
            initial.photoType.push({
                product_id: value.product_id,
                value: value.variant.photo_type,
            });
            initial.background.push({
                product_id: value.product_id,
                value: value.variant.background,
            });
            initial.color.push({
                product_id: value.product_id,
                value: value.variant.color,
            });
        }

        if (value.note) {
            initial.note.push({
                product_id: value.product_id,
                value: value.note,
            });
        }
    });

    return initial;
};

const hasValue = (
    list: ProductData<string>[] | ProductData<ProductOrientation>[],
    productId: number,
) => list.some((item) => item.product_id === productId);

/**
 * Murals require every variant plus the printed note; other products
 * have no required fields.
 */
export const validateDetailForm = (
    products: SelectableProduct[],
    data: DetailFormData,
): DetailFormErrors => {
    const errors: DetailFormErrors = {};

    products.forEach((product) => {
        if (product.product_type_id !== MURAL_PRODUCT_TYPE_ID) {
            return;
        }

        const productErrors: Partial<Record<keyof DetailFormData, string>> = {};

        if (!hasValue(data.orientation, product.id)) {
            productErrors.orientation = 'Debes elegir una opción';
        }

        if (!hasValue(data.photoType, product.id)) {
            productErrors.photoType = 'Debes elegir una opción';
        }

        if (!hasValue(data.background, product.id)) {
            productErrors.background = 'Debes elegir una opción';
        }

        if (!hasValue(data.color, product.id)) {
            productErrors.color = 'Debes elegir una opción';
        }

        if (!hasValue(data.note, product.id)) {
            productErrors.note =
                'Este campo es requerido cuando el producto es un mural';
        }

        if (Object.keys(productErrors).length > 0) {
            errors[product.id] = productErrors;
        }
    });

    return errors;
};

const valueFor = <T>(list: ProductData<T>[], productId: number) =>
    list.find((item) => item.product_id === productId)?.value;

/**
 * Maps the modal state to order details. Only murals carry a variant.
 * Assumes the data was validated first.
 */
export const buildProductOrders = (
    products: SelectableProduct[],
    data: DetailFormData,
): ProductOrder[] =>
    products.map((product) => ({
        combo_id: product.combo_id,
        product_id: product.id,
        variant:
            product.product_type_id === MURAL_PRODUCT_TYPE_ID
                ? {
                      orientation: valueFor(data.orientation, product.id)!,
                      photo_type: valueFor(data.photoType, product.id)!,
                      background: valueFor(data.background, product.id)!,
                      color: valueFor(data.color, product.id)!,
                  }
                : undefined,
        note: valueFor(data.note, product.id) || '',
    }));

/**
 * Variants may come from the combo pivot (and as a JSON string) or from
 * the product itself.
 */
export const resolveVariants = (product: SelectableProduct) => {
    const variants = product.pivot?.variants ?? product.variants;

    return typeof variants === 'string'
        ? (JSON.parse(variants) as typeof product.variants)
        : variants;
};
