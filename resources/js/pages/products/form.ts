export type ProductVariants = NonNullable<Product['variants']>;

export type FormData = Pick<Product, 'name' | 'product_type_id'> & {
    unit_price: string;
    max_payments: string;
    variants: {
        colors: Color[];
        backgrounds: Color[];
        dimentions: string;
        photo_types: ProductPhotoType[];
        orientations: ProductOrientation[];
    };
};

export const orientations: ProductVariants['orientations'] = [
    'vertical',
    'horizontal',
];

export const colors: Color[] = ['white', 'black', 'blue', 'pink'];

export const backgrounds: ProductVariants['backgrounds'] = [
    'white',
    'black',
    'blue',
    'pink',
];

export const photo_types: ProductVariants['photo_types'] = [
    'individual',
    'grupo',
];

export const default_variants: ProductVariants = {
    dimentions: '',
    photo_types: ['grupo'],
    orientations: ['vertical'],
    colors: [],
    backgrounds: [],
};
