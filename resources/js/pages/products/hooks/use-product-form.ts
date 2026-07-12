import { getError } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler } from 'react';
import { default_variants, FormData } from '../form';

export function useProductForm(product?: Product) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: product?.name ?? '',
        unit_price: product ? String(product.unit_price) : '0',
        max_payments: product ? String(product.max_payments) : '0',
        product_type_id: product?.product_type_id ?? 0,
        variants: product?.variants ?? default_variants,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (product) {
            put(route('products.update', { product: product.id }));
        } else {
            post(route('products.store'));
        }
    };

    const getVariantError = (path: string) => getError(path, errors);

    const setVariant =
        (
            key: Exclude<keyof FormData['variants'], 'dimentions'>,
            value: string,
        ) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            setData('variants', {
                ...data.variants,
                [key]: e.target.checked
                    ? Array.from(
                          new Set([
                              ...(Array.isArray(data.variants[key])
                                  ? data.variants[key]
                                  : []),
                              value,
                          ]),
                      ) // Add if checked
                    : data.variants[key].filter((item) => item !== value),
            });
        };

    return {
        data,
        setData,
        processing,
        errors,
        submit,
        getVariantError,
        setVariant,
    };
}

export type ProductFormController = ReturnType<typeof useProductForm>;
