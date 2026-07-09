export type FormData = Pick<Stockable, 'name' | 'unit'> & {
    alert_at: string;
    quantity: string;
};
