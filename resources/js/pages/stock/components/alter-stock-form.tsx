import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { Edit, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import { FormEvent, FormEventHandler, useState } from 'react';
import { QuantityField } from './quantity-field';

const forms = [
    {
        key: 'subtract_quantity',
        title: 'Restar',
        icon: MinusCircleIcon,
    },
    {
        key: 'add_quantity',
        title: 'Sumar',
        icon: PlusCircleIcon,
    },
    {
        key: 'new_quantity',
        title: 'Editar',
        icon: Edit,
    },
] as const;

type FormKey = 'subtract_quantity' | 'add_quantity' | 'new_quantity';

export function AlterStockForm({
    stockable,
    show,
    onClose,
}: {
    stockable: Stockable;
    show: boolean;
    onClose: () => void;
}) {
    const [activeForm, setActiveForm] = useState<FormKey>('new_quantity');
    const { data, setData, put, processing, errors, reset } = useForm({
        quantity: stockable.quantity,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('stockables.update', { stockable: stockable.id }), {
            onFinish: () => {
                //show toast
                onClose();
                reset('quantity');
            },
        });
    };

    const onFormChange = (form: FormKey) => {
        return (e: FormEvent) => {
            e.preventDefault();
            setActiveForm(form);
        };
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <header>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {stockable.name} - Modificar stock
                    </h2>
                </header>

                <div className="flex flex-col">
                    <nav className="my-4 flex justify-start overflow-hidden rounded-xl border">
                        {forms.map((form) => (
                            <Button
                                key={form.title}
                                size="sm"
                                variant="ghost"
                                onClick={onFormChange(form.key)}
                                className={cn('flex-1 rounded-none', {
                                    'bg-muted': activeForm === form.key,
                                    'border-b-4 border-b-primary':
                                        activeForm === form.key,
                                })}
                            >
                                <form.icon />
                                {form.title}
                            </Button>
                        ))}
                    </nav>

                    {activeForm === 'new_quantity' && (
                        <QuantityField
                            label="Cantidad"
                            value={data.quantity}
                            error={errors['quantity']}
                            onChange={(quantity) =>
                                setData('quantity', quantity)
                            }
                        />
                    )}

                    {activeForm === 'add_quantity' && (
                        <QuantityField
                            label="Cantidad a añadir"
                            error={errors['quantity']}
                            onChange={(quantity) =>
                                setData(
                                    'quantity',
                                    stockable.quantity + quantity,
                                )
                            }
                        />
                    )}

                    {activeForm === 'subtract_quantity' && (
                        <QuantityField
                            label="Cantidad a sustraer"
                            error={errors['quantity']}
                            onChange={(quantity) =>
                                setData(
                                    'quantity',
                                    stockable.quantity - quantity,
                                )
                            }
                        />
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild disabled={processing}>
                            <Link href={route('stockables.index')}>
                                Cancelar
                            </Link>
                        </Button>

                        <Button disabled={processing} type="submit">
                            {processing ? 'Guardando' : 'Agregar stockeables'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
