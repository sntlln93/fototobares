export type FormData = Pick<Stockable, 'name' | 'unit'> & {
    products: number[];
    alert_at: string;
    quantity: string;
};
