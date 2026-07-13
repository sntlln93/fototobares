import { ComboWithProducts, ProductOrder } from './form';

export type PriceLine = {
    label: string;
    /** Signed: combos and extras add, subtractions take away */
    amount: number;
};

export type PriceBreakdown = {
    lines: PriceLine[];
    total: number;
};

const detailsOfCombo = (details: ProductOrder[], comboId: number) =>
    details.filter((detail) => detail.combo_id === comboId);

/**
 * Combos present in the cart, in the order they were added. A combo is in the
 * cart while at least one of its products is: taking every product out of a
 * combo removes the combo, and with it its price.
 */
const combosInCart = (details: ProductOrder[]) => [
    ...new Set(
        details
            .map((detail) => detail.combo_id)
            .filter((comboId): comboId is number => comboId !== undefined),
    ),
];

/**
 * The order price is the price of each combo — minus the subtract value of the
 * products taken out of it — plus the list price of the products added outside
 * any combo. Never accumulates over a previous total: it is a function of the
 * cart alone, so adding a second combo cannot double-count the first.
 */
export const priceBreakdown = (
    details: ProductOrder[],
    combos: ComboWithProducts[],
    products: Product[],
): PriceBreakdown => {
    const lines: PriceLine[] = [];
    const extras: ProductOrder[] = details.filter(
        (detail) => detail.combo_id === undefined,
    );

    combosInCart(details).forEach((comboId) => {
        const combo = combos.find((candidate) => candidate.id === comboId);

        // A combo deleted from the catalog (a restored draft may still name
        // it) prices its products as if they had been added on their own
        if (!combo) {
            extras.push(...detailsOfCombo(details, comboId));

            return;
        }

        lines.push({ label: combo.name, amount: combo.suggested_price });

        const kept = detailsOfCombo(details, comboId).map(
            (detail) => detail.product_id,
        );

        combo.products
            .filter((product) => !kept.includes(product.id))
            .filter((product) => product.pivot.subtract_value > 0)
            .forEach((product) => {
                lines.push({
                    label: `Sin ${product.name}`,
                    amount: -product.pivot.subtract_value,
                });
            });
    });

    extras.forEach((detail) => {
        const product = products.find(
            (candidate) => candidate.id === detail.product_id,
        );

        if (!product) return;

        lines.push({ label: product.name, amount: product.unit_price });
    });

    const total = lines.reduce((sum, line) => sum + line.amount, 0);

    // Subtractions bigger than the combo price would leave the seller with a
    // negative total to correct by hand
    return { lines, total: Math.max(total, 0) };
};

export const computeTotal = (
    details: ProductOrder[],
    combos: ComboWithProducts[],
    products: Product[],
): number => priceBreakdown(details, combos, products).total;
