export type ProductOrder = {
    variant?: {
        orientation: ProductOrientation;
        photo_type: ProductPhotoType;
        background: string;
        color: string;
    };
    product_id: number;
    combo_id?: number;
    note: string;
};

export type ComboProductPivot = {
    quantity: number;
    /** How much the combo price drops when this product is taken out */
    subtract_value: number;
    /** The combo may restrict the variants of the product; JSON as sent */
    variants?: Product['variants'] | string | null;
};

export type ComboProduct = Product & { pivot: ComboProductPivot };

/** A combo as the order wizard receives it: products carry their pivot */
export type ComboWithProducts = Combo & { products: ComboProduct[] };

export type SelectableProduct = Product & {
    combo_id?: number;
    pivot?: { variants: Product['variants'] };
};
