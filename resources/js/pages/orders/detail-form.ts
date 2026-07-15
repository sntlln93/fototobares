import { resolveVariantDefinitions } from '@/lib/variants';
import { ProductOrder, SelectableProduct } from './form';

/**
 * Murals require the printed note regardless of their variants. Orthogonal
 * to the variant system — kept as its own list so removing it later is a
 * one-line change, not an archaeology dig.
 */
export const NOTE_REQUIRED_TYPE_IDS = [1];

export type ProductDetailFormData = {
    values: VariantSelection;
    note: string;
};

export type DetailFormData = Record<number, ProductDetailFormData>;

export type DetailFormErrors = Record<number, Partial<Record<string, string>>>;

const emptyProductData = (): ProductDetailFormData => ({
    values: {},
    note: '',
});

/**
 * Builds the modal state from existing values when editing an added product.
 */
export const initialDetailFormData = (
    initialValues?: ProductOrder[],
): DetailFormData => {
    const initial: DetailFormData = {};

    initialValues?.forEach((value) => {
        initial[value.product_id] = {
            values: value.variant ?? {},
            note: value.note ?? '',
        };
    });

    return initial;
};

/**
 * Every non-nullable variant definition requires a value; nullable ones
 * never error out, since they can be defined later. Murals additionally
 * require the printed note.
 */
export const validateDetailForm = (
    products: SelectableProduct[],
    data: DetailFormData,
): DetailFormErrors => {
    const errors: DetailFormErrors = {};

    products.forEach((product) => {
        const productData = data[product.id] ?? emptyProductData();
        const productErrors: Partial<Record<string, string>> = {};

        resolveVariantDefinitions(product).forEach((definition) => {
            if (!definition.nullable && !productData.values[definition.label]) {
                productErrors[definition.label] = 'Debes elegir una opción';
            }
        });

        if (
            NOTE_REQUIRED_TYPE_IDS.includes(product.product_type_id) &&
            !productData.note
        ) {
            productErrors.note =
                'Este campo es requerido cuando el producto es un mural';
        }

        if (Object.keys(productErrors).length > 0) {
            errors[product.id] = productErrors;
        }
    });

    return errors;
};

/**
 * Maps the modal state to order details. Nullable definitions left unset
 * are sent as an explicit null selection, so the backend snapshots them as
 * pending. Assumes the data was validated first.
 */
export const buildProductOrders = (
    products: SelectableProduct[],
    data: DetailFormData,
): ProductOrder[] =>
    products.map((product) => {
        const productData = data[product.id] ?? emptyProductData();
        const definitions = resolveVariantDefinitions(product);

        const variant: VariantSelection = {};
        definitions.forEach((definition) => {
            variant[definition.label] =
                productData.values[definition.label] ?? null;
        });

        return {
            combo_id: product.combo_id,
            product_id: product.id,
            variant: definitions.length > 0 ? variant : undefined,
            note: productData.note || '',
        };
    });
