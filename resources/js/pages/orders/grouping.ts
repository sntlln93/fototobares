import { ComboWithProducts, ProductOrder } from './form';

/** A detail plus its position in `order_details`: edit and remove act by index */
export type DetailEntry = { detail: ProductOrder; index: number };

export type ComboGroup = { combo: ComboWithProducts; items: DetailEntry[] };

export type GroupedDetails = {
    comboGroups: ComboGroup[];
    extras: DetailEntry[];
};

/**
 * Splits the cart into one section per combo — in the order the combos were
 * added — plus the products added outside any combo. A detail naming a combo
 * that no longer exists is shown among the extras, which is also how it gets
 * priced.
 */
export const groupDetails = (
    details: ProductOrder[],
    combos: ComboWithProducts[],
): GroupedDetails => {
    const comboGroups: ComboGroup[] = [];
    const extras: DetailEntry[] = [];

    details.forEach((detail, index) => {
        const combo = combos.find(
            (candidate) => candidate.id === detail.combo_id,
        );

        if (!combo) {
            extras.push({ detail, index });

            return;
        }

        const group = comboGroups.find((g) => g.combo.id === combo.id);

        if (group) {
            group.items.push({ detail, index });

            return;
        }

        comboGroups.push({ combo, items: [{ detail, index }] });
    });

    return { comboGroups, extras };
};
