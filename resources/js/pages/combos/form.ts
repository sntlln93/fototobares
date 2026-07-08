export type FormData = Pick<Combo, 'name'> & {
    products: SelectedProduct[];
    suggested_max_payments: string;
    suggested_price: string;
};

export type SelectedProduct = {
    id: number;
    quantity: number;
    variants?: Product['variants'];
};

/**
 * Adds a product to the combo or, when it is already selected, replaces
 * its variants keeping the chosen quantity (used by the edit button).
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
            ? { ...incoming, quantity: existing.quantity }
            : product,
    );
};
