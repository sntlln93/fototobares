export type ProductOrder = {
    variant?: VariantSelection;
    product_id: number;
    combo_id?: number;
    note: string;
};

export type ComboProductPivot = {
    quantity: number;
    /** How much the combo price drops when this product is taken out */
    subtract_value: number;
    /** The combo may restrict the product's variant options */
    variants?: ComboVariantSubset | null;
};

export type ComboProduct = Product & { pivot: ComboProductPivot };

/** A combo as the order wizard receives it: products carry their pivot */
export type ComboWithProducts = Combo & { products: ComboProduct[] };

export type SelectableProduct = Product & {
    combo_id?: number;
    pivot?: { variants?: ComboVariantSubset | null };
};
