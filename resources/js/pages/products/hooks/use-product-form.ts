import { getError } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { FormData } from '../form';

export function useProductForm(product?: Product) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: product?.name ?? '',
        unit_price: product ? String(product.unit_price) : '0',
        max_payments: product ? String(product.max_payments) : '0',
        product_type_id: product?.product_type_id ?? 0,
        variants: product?.variants ?? null,
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

    return {
        data,
        setData,
        processing,
        errors,
        submit,
        getVariantError,
    };
}

export type ProductFormController = ReturnType<typeof useProductForm>;
