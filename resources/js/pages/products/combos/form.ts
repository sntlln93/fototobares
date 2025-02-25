export type FormData = Pick<
    Combo,
    'name' | 'suggested_price' | 'suggested_max_payments'
> & {
    products: SelectedProduct[];
};

export type SelectedProduct = {
    id: number;
    quantity: number;
    variants?: Product['variants'];
};
