import { nextStatusFor, toggleGroup, toggleId } from '@/hooks/use-selection';
import { describe, expect, it } from 'vitest';

describe('toggleId', () => {
    it('adds an unselected id', () => {
        expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it('removes an already selected id', () => {
        expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
    });
});

describe('toggleGroup', () => {
    it('selects the whole group when none is selected', () => {
        expect(toggleGroup([], [1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('completes the group without duplicating already selected ids', () => {
        expect(toggleGroup([2, 9], [1, 2, 3])).toEqual([2, 9, 1, 3]);
    });

    it('unselects the group when every item is already selected', () => {
        expect(toggleGroup([1, 2, 3, 9], [1, 2, 3])).toEqual([9]);
    });

    it('keeps selections from other groups untouched', () => {
        expect(toggleGroup([7, 8], [1, 2])).toEqual([7, 8, 1, 2]);
    });
});

describe('nextStatusFor', () => {
    const statuses: ProductionStatus[] = [
        { id: 10, name: 'Sin foto', position: 1 },
        { id: 11, name: 'Impreso', position: 2 },
        { id: 12, name: 'Embolsado', position: 3 },
    ];

    it('returns the first status when production has not started', () => {
        expect(nextStatusFor(statuses, 0)?.name).toBe('Sin foto');
    });

    it('returns the following status', () => {
        expect(nextStatusFor(statuses, 1)?.name).toBe('Impreso');
    });

    it('returns undefined at the last status', () => {
        expect(nextStatusFor(statuses, 3)).toBeUndefined();
    });
});
