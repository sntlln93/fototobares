export type FormData = Pick<Combo, 'name'> & {
    products: SelectedProduct[];
    suggested_max_payments: string;
    suggested_price: string;
};

export type SelectedProduct = {
    id: number;
    quantity: number;
    variants?: Product['variants'];
};
