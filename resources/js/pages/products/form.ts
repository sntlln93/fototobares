export type FormData = Pick<Product, 'name' | 'type'> & {
    unit_price: string;
    max_payments: string;
    variants: {
        colors: string[];
        backgrounds: string[];
        dimentions: string;
        photo_types: ProductPhotoType[];
        orientations: ProductOrientation[];
    };
};

export const orientations: Product['variants']['orientations'] = [
    'vertical',
    'horizontal',
];

export const colors: Product['variants']['colors'] = [
    'blanco',
    'negro',
    'azul',
    'rosa',
];

export const backgrounds: Product['variants']['backgrounds'] = [
    'blanco',
    'negro',
    'azul',
    'rosa',
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
