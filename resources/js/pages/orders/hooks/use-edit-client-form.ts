import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export function useEditClientForm(order: Order) {
    const { data, setData, put, processing, errors } = useForm<{
        name: string | null;
        phone: string | null;
        child_name: string | null;
        attended_photo_session: boolean | null;
    }>({
        name: order.client?.name || null,
        phone: order.client?.phone || null,
        child_name: order.child_name || null,
        attended_photo_session: order.attended_photo_session ?? null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('orders.update-client', { order: order.id }), {
            onSuccess: () => {
                toast.success('Datos del cliente actualizados exitosamente');
            },
        });
    };

    return {
        data,
        setData,
        errors,
        processing,
        submit,
    };
}

export type EditClientFormController = ReturnType<typeof useEditClientForm>;
