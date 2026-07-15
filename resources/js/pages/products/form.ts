export type FormData = Pick<Product, 'name' | 'product_type_id'> & {
    unit_price: string;
    max_payments: string;
    variants: VariantDefinition[] | null;
};

export const VARIANT_NAME_SUGGESTIONS = [
    'Color',
    'Talle',
    'Fondo',
    'Orientación',
    'Tipo de foto',
];
