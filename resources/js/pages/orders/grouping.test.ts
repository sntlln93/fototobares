import { describe, expect, it } from 'vitest';
import { ComboWithProducts, ProductOrder } from './form';
import { groupDetails } from './grouping';

const combo = { id: 1, name: 'Combo 1 (M.A)' } as ComboWithProducts;
const otherCombo = { id: 2, name: 'Combo 2 (CLA)' } as ComboWithProducts;
const combos = [combo, otherCombo];

const detail = (productId: number, comboId?: number): ProductOrder => ({
    product_id: productId,
    combo_id: comboId,
    note: '',
});

describe('groupDetails', () => {
    it('groups the details under their combo and keeps the rest apart', () => {
        const details = [detail(1, 1), detail(2), detail(3, 1)];

        const { comboGroups, extras } = groupDetails(details, combos);

        expect(comboGroups).toHaveLength(1);
        expect(comboGroups[0].combo.name).toBe('Combo 1 (M.A)');
        expect(comboGroups[0].items.map((item) => item.detail)).toEqual([
            details[0],
            details[2],
        ]);
        expect(extras.map((item) => item.detail)).toEqual([details[1]]);
    });

    it('keeps the index of each detail so edit and remove still address it', () => {
        const details = [detail(1, 1), detail(2), detail(3, 1)];

        const { comboGroups, extras } = groupDetails(details, combos);

        expect(comboGroups[0].items.map((item) => item.index)).toEqual([0, 2]);
        expect(extras.map((item) => item.index)).toEqual([1]);
    });

    it('lists the combos in the order they were added', () => {
        const details = [detail(1, 2), detail(2, 1)];

        const { comboGroups } = groupDetails(details, combos);

        expect(comboGroups.map((group) => group.combo.id)).toEqual([2, 1]);
    });

    it('shows the products of a combo that no longer exists among the extras', () => {
        const details = [detail(1, 99)];

        const { comboGroups, extras } = groupDetails(details, combos);

        expect(comboGroups).toEqual([]);
        expect(extras.map((item) => item.detail)).toEqual(details);
    });

    it('returns empty sections for an empty cart', () => {
        expect(groupDetails([], combos)).toEqual({
            comboGroups: [],
            extras: [],
        });
    });
});
