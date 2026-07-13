export type FormData = Pick<Combo, 'name'> & {
    products: SelectedProduct[];
    default_payments: string;
    suggested_price: string;
};

export type SelectedProduct = {
    id: number;
    quantity: number;
    /** How much the combo price drops when this product is taken out */
    subtract_value: number;
    variants?: Product['variants'];
};

/**
 * Adds a product to the combo or, when it is already selected, replaces
 * its variants keeping the quantity and the subtract value (used by the
 * edit button, whose modal only edits variants).
 */
export const upsertSelectedProduct = (
    selected: SelectedProduct[],
    incoming: SelectedProduct,
): SelectedProduct[] => {
    const existing = selected.find((product) => product.id === incoming.id);

    if (!existing) {
        return [...selected, incoming];
    }

    return selected.map((product) =>
        product.id === incoming.id
            ? {
                  ...incoming,
                  quantity: existing.quantity,
                  subtract_value: existing.subtract_value,
              }
            : product,
    );
};
