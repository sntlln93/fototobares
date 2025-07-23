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

export const orientations: Product['variants']['orientations'] = [
    'vertical',
    'horizontal',
];

export const colors: Color[] = ['white', 'black', 'blue', 'pink'];

export const backgrounds: Product['variants']['backgrounds'] = [
    'white',
    'black',
    'blue',
    'pink',
];

export const photo_types: Product['variants']['photo_types'] = [
    'individual',
    'grupo',
];

export const default_variants: Product['variants'] = {
    dimentions: '',
    photo_types: ['grupo'],
    orientations: ['vertical'],
    colors: [],
    backgrounds: [],
};
