import { describe, expect, it } from 'vitest';
import {
    hasPendingVariants,
    resolveVariantDefinitions,
    selectionFromSnapshot,
    snapshotFromSelection,
    variantSummary,
} from './variants';

const definitions: VariantDefinition[] = [
    {
        label: 'Color',
        type: 'color',
        nullable: false,
        options: [
            { label: 'Negro', color: '#1c1917' },
            { label: 'Rosa', color: '#f9a8d4' },
        ],
    },
    {
        label: 'Talle',
        type: 'text',
        nullable: true,
        options: [{ label: 'Único' }, { label: 'S' }, { label: 'M' }],
    },
];

describe('resolveVariantDefinitions', () => {
    it('returns the product definitions as-is without a combo subset', () => {
        const product = { variants: definitions };

        expect(resolveVariantDefinitions(product)).toEqual(definitions);
    });

    it('restricts options to the combo pivot subset by intersection', () => {
        const product = {
            variants: definitions,
            pivot: { variants: { Color: ['Negro'] } },
        };

        const resolved = resolveVariantDefinitions(product);

        expect(resolved[0].options).toEqual([
            { label: 'Negro', color: '#1c1917' },
        ]);
        expect(resolved[1].options).toEqual(definitions[1].options);
    });

    it('falls back to an empty list when the product has no definitions', () => {
        expect(resolveVariantDefinitions({})).toEqual([]);
    });
});

describe('selectionFromSnapshot', () => {
    it('maps each entry to its selected option label', () => {
        const snapshot: VariantSnapshotEntry[] = [
            {
                label: 'Color',
                type: 'color',
                value: { label: 'Negro', color: '#1c1917' },
            },
            { label: 'Talle', type: 'text', value: null },
        ];

        expect(selectionFromSnapshot(snapshot)).toEqual({
            Color: 'Negro',
            Talle: null,
        });
    });

    it('handles a missing snapshot', () => {
        expect(selectionFromSnapshot(null)).toEqual({});
    });
});

describe('snapshotFromSelection', () => {
    it('resolves each selection to its full option', () => {
        const snapshot = snapshotFromSelection(definitions, {
            Color: 'Rosa',
            Talle: null,
        });

        expect(snapshot).toEqual([
            {
                label: 'Color',
                type: 'color',
                value: { label: 'Rosa', color: '#f9a8d4' },
            },
            { label: 'Talle', type: 'text', value: null },
        ]);
    });

    it('treats an unselected label as pending', () => {
        const snapshot = snapshotFromSelection(definitions, {});

        expect(snapshot[0].value).toBeNull();
        expect(snapshot[1].value).toBeNull();
    });
});

describe('variantSummary', () => {
    it('joins resolved values and flags pending ones by label', () => {
        const snapshot: VariantSnapshotEntry[] = [
            {
                label: 'Color',
                type: 'color',
                value: { label: 'Negro', color: '#1c1917' },
            },
            { label: 'Talle', type: 'text', value: null },
        ];

        expect(variantSummary(snapshot)).toBe('Negro · Talle: a definir');
    });

    it('returns an empty string for a product without variants', () => {
        expect(variantSummary([])).toBe('');
    });
});

describe('hasPendingVariants', () => {
    it('detects a pending entry', () => {
        expect(
            hasPendingVariants([{ label: 'Talle', type: 'text', value: null }]),
        ).toBe(true);
    });

    it('is false when every entry is resolved', () => {
        expect(
            hasPendingVariants([
                { label: 'Color', type: 'color', value: { label: 'Negro' } },
            ]),
        ).toBe(false);
    });
});
