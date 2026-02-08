import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, Edit, Trash } from 'lucide-react';
import { FormEvent, FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

type AccordionValue = 'products' | 'client' | 'order' | undefined;

type OrderDetailForm = {
    product_id: number;
    note: string | null;
    variant: Record<string, string>;
};

export default function EditOrder({
    order,
}: PageProps<{
    order: Order;
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pedidos',
            href: route('orders.index'),
        },
        {
            title: `Editar Pedido #${order.id}`,
            href: route('orders.edit', { order: order.id }),
        },
    ];

    const [accordionValue, setAccordionValue] =
        useState<AccordionValue>('client');

    // Transform order data for form - preserve existing note and variant from pivot
    const orderDetails = order.products.map((product) => ({
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

    const toStep = (newAccordionValue: AccordionValue) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Pedido #${order.id}`} />

            <form onSubmit={submit} className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={accordionValue}
                >
                    <AccordionItem value="client">
                        <AccordionTrigger onClick={toStep('client')}>
                            <div className="flex items-center gap-2">
                                {(errors.name || errors.phone) && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Cliente
                                {data.name && <Badge>{`${data.name}`}</Badge>}
                                {data.phone && <Badge>{`${data.phone}`}</Badge>}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <div>
                                <Label>Nombre</Label>
                                <Input
                                    placeholder="Nombre del cliente"
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="mt-3">
                                <Label>Teléfono</Label>
                                <InputHint
                                    className="mt-2"
                                    message="Un número de teléfono válido contiene sólo 10 dígitos"
                                />
                                <Input
                                    placeholder="3804125834"
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="mt-3">
                                <Label>Nombre del niño</Label>
                                <Input
                                    placeholder="Ej: Juan"
                                    type="text"
                                    id="child_name"
                                    name="child_name"
                                    value={data.child_name}
                                    onChange={(e) =>
                                        setData('child_name', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.child_name} />
                            </div>

                            <div className="mt-3">
                                <Label htmlFor="attended_photo_session">
                                    ¿Asistió a la sesión de fotos?
                                </Label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex cursor-pointer items-center">
                                        <input
                                            type="radio"
                                            name="attended_photo_session"
                                            value="true"
                                            checked={
                                                data.attended_photo_session ===
                                                true
                                            }
                                            onChange={() =>
                                                setData(
                                                    'attended_photo_session',
                                                    true,
                                                )
                                            }
                                            className="mr-2"
                                        />
                                        Sí
                                    </label>
                                    <label className="flex cursor-pointer items-center">
                                        <input
                                            type="radio"
                                            name="attended_photo_session"
                                            value="false"
                                            checked={
                                                data.attended_photo_session ===
                                                false
                                            }
                                            onChange={() =>
                                                setData(
                                                    'attended_photo_session',
                                                    false,
                                                )
                                            }
                                            className="mr-2"
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route('orders.show', {
                                            order: order.id,
                                        })}
                                    >
                                        Cancelar
                                    </Link>
                                </Button>

                                <Button onClick={toStep('products')}>
                                    Siguiente
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="products">
                        <AccordionTrigger onClick={toStep('products')}>
                            <div className="flex items-center gap-2">
                                Productos ({order.products.length})
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <ul className="space-y-2">
                                {order.products.map((product) => (
                                    <li
                                        key={product.id}
                                        className="flex items-center justify-between rounded-md border border-input bg-background px-4 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {product.type?.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="warning"
                                                size="icon"
                                                disabled
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                disabled
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <InputError message={errors.order_details} />

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={toStep('client')}
                                >
                                    Anterior
                                </Button>

                                <Button onClick={toStep('order')}>
                                    Siguiente
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="order">
                        <AccordionTrigger onClick={toStep('order')}>
                            <div className="flex items-center gap-2">
                                {(errors.total_price ||
                                    errors.payment_plan ||
                                    errors.due_date) && (
                                    <AlertCircle className="h-5 w-5 stroke-destructive" />
                                )}
                                Pedido
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1">
                            <div className="mt-3">
                                <Label>Precio final</Label>
                                <Input
                                    type="number"
                                    id="total_price"
                                    name="total_price"
                                    value={data.total_price}
                                    onChange={(e) =>
                                        setData('total_price', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.total_price} />
                            </div>

                            <div className="mt-3">
                                <Label>Cuotas</Label>
                                <Input
                                    type="number"
                                    id="payment_plan"
                                    name="payment_plan"
                                    value={data.payment_plan}
                                    onChange={(e) =>
                                        setData('payment_plan', e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.payment_plan}
                                />
                                <InputHint
                                    className="mt-2"
                                    message={`${data.payment_plan} cuotas de ${formatPrice(Number(data.total_price) / (Number(data.payment_plan) || 1))}`}
                                />
                            </div>

                            <div className="mt-3">
                                <Label>Primer vencimiento</Label>
                                <div className="block">
                                    <DatePicker
                                        placeholder="Primer vencimiento"
                                        date={
                                            data.due_date
                                                ? new Date(data.due_date)
                                                : new Date()
                                        }
                                        setDate={(date) =>
                                            setData(
                                                'due_date',
                                                format(
                                                    date ?? new Date(),
                                                    'yyyy-MM-dd',
                                                ),
                                            )
                                        }
                                    />
                                </div>

                                <InputError
                                    className="mt-2"
                                    message={errors.due_date}
                                />
                            </div>

                            <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route('orders.show', {
                                            order: order.id,
                                        })}
                                    >
                                        Cancelar
                                    </Link>
                                </Button>

                                <Button disabled={processing} onClick={submit}>
                                    Guardar cambios
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </form>
        </AppLayout>
    );
}
