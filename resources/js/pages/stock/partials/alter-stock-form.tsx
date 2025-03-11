import InputError from '@/components/input-error';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { Edit, MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import { FormEvent, FormEventHandler, useState } from 'react';

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

export function AlterStockForm({
    stockable,
    show,
    onClose,
}: {
    stockable: Stockable;
    show: boolean;
    onClose: CallableFunction;
}) {
    const [activeForm, setActiveForm] = useState<
        'subtract_quantity' | 'add_quantity' | 'new_quantity'
    >('new_quantity');
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

    const onFormChange = (
        form: 'subtract_quantity' | 'add_quantity' | 'new_quantity',
    ) => {
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
                        <section className="full-w my-2">
                            <Label htmlFor="quantity">Cantidad</Label>

                            <div className="flex flex-1 gap-2">
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min={0}
                                    value={data.quantity}
                                    onChange={(e) =>
                                        setData(
                                            'quantity',
                                            Number(e.target.value),
                                        )
                                    }
                                    className="h-10"
                                />
                            </div>

                            <InputError
                                message={errors['quantity']}
                                className="mt-2"
                            />
                        </section>
                    )}

                    {activeForm === 'add_quantity' && (
                        <section className="full-w my-2">
                            <Label htmlFor="quantity">Cantidad a añadir</Label>

                            <div className="flex flex-1 gap-2">
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min={0}
                                    onChange={(e) =>
                                        setData(
                                            'quantity',
                                            stockable.quantity +
                                                Number(e.target.value),
                                        )
                                    }
                                    className="h-10"
                                />
                            </div>

                            <InputError
                                message={errors['quantity']}
                                className="mt-2"
                            />
                        </section>
                    )}

                    {activeForm === 'subtract_quantity' && (
                        <section className="full-w my-2">
                            <Label htmlFor="quantity">
                                Cantidad a sustraer
                            </Label>

                            <div className="flex flex-1 gap-2">
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min={0}
                                    onChange={(e) =>
                                        setData(
                                            'quantity',
                                            stockable.quantity -
                                                Number(e.target.value),
                                        )
                                    }
                                    className="h-10"
                                />
                            </div>

                            <InputError
                                message={errors['quantity']}
                                className="mt-2"
                            />
                        </section>
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
