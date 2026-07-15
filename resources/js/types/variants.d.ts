declare global {
    type VariantType = 'text' | 'color';

    interface VariantOption {
        label: string;
        color?: string;
    }

    interface VariantDefinition {
        label: string;
        type: VariantType;
        nullable: boolean;
        options: VariantOption[];
    }

    /** Client selection: label -> chosen option label, or null when left pending */
    type VariantSelection = Record<string, string | null>;

    interface VariantSnapshotEntry {
        label: string;
        type: VariantType;
        value: VariantOption | null;
    }

    /** Combo restriction: label -> allowed option labels; absent key means unrestricted */
    type ComboVariantSubset = Record<string, string[]>;
}

export {};
