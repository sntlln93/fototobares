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
