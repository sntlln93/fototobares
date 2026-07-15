import { selectionFromSnapshot } from '@/lib/variants';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export function useEditVariantForm(orderId: number, product: OrderProduct) {
    const { data, setData, put, processing, errors } = useForm<{
        detail_id: number;
        variant: VariantSelection;
    }>({
        detail_id: product.order_detail_id,
        variant: selectionFromSnapshot(product.variant),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('orders.variant', { order: orderId }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Variante actualizada');
            },
        });
    };

    return { data, setData, errors, processing, submit };
}

export type EditVariantFormController = ReturnType<typeof useEditVariantForm>;
