import { useForm } from '@inertiajs/react';
import { FormEvent, FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

export type EditAccordionValue = 'products' | 'client' | 'order' | undefined;

export type OrderDetailForm = {
    /** The order_details row: an order may repeat a product */
    id: number;
    product_id: number;
    note: string | null;
    variant: Record<string, string>;
};

export function useEditOrder(order: Order) {
    const [accordionValue, setAccordionValue] =
        useState<EditAccordionValue>('client');

    // Transform order data for form - preserve existing note and variant from
    // pivot, addressed by the detail id so repeated products stay apart
    const orderDetails = order.products.map((product) => ({
        id: product.order_detail_id,
        product_id: product.id,
        note: product.note || null,
        variant: product.variant || {},
    }));

    const { data, setData, put, processing, errors } = useForm<{
        name: string;
        phone: string;
        child_name: string;
        attended_photo_session: boolean | null;
        total_price: string;
        payment_plan: string;
        due_date: string;
        classroom_id: number;
        order_details: OrderDetailForm[];
    }>({
        name: order.client?.name || '',
        phone: order.client?.phone || '',
        child_name: order.child_name || '',
        attended_photo_session: order.attended_photo_session ?? null,
        total_price: String(order.total_price),
        payment_plan: String(order.payment_plan),
        due_date: order.due_date,
        classroom_id: order.classroom_id,
        order_details: orderDetails,
    });

    const toStep = (newAccordionValue: EditAccordionValue) => {
        return (e: FormEvent) => {
            e.preventDefault();
            if (newAccordionValue === accordionValue) {
                return setAccordionValue(undefined);
            }
            setAccordionValue(newAccordionValue);
        };
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('orders.update', { order: order.id }), {
            onSuccess: () => {
                toast.success('Pedido actualizado exitosamente');
            },
        });
    };

    return {
        data,
        setData,
        errors,
        processing,
        accordionValue,
        toStep,
        submit,
    };
}

export type EditOrderController = ReturnType<typeof useEditOrder>;
