import { InputError } from '@/components/inputError';
import { InputLabel } from '@/components/inputLabel';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { FormEventHandler, MouseEventHandler } from 'react';

export function AlterStockForm({
    stockable,
    show,
    onClose,
}: {
    stockable: Stockable;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        quantity: stockable.quantity,
    });

    const toAdd = data.quantity - stockable.quantity;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('stockables.update', { stockable: stockable.id }), {
            data: data,
            onFinish: () => {
                //show toast
                onClose();
                reset('quantity');
            },
        });
    };

    const increase: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        setData('quantity', data.quantity + 1);
    };

    const decrease: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (data.quantity === 0) return;

        setData('quantity', data.quantity - 1);
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <header>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {stockable.name} - Modificar stock
                    </h2>
                </header>
                <div className="mt-6">
                    <InputLabel htmlFor="quantity" value="Cantidad" />

                    <div className="mt-1 flex gap-2">
                        <Input
                            id="og_quantity"
                            name="og_quantity"
                            value={stockable.quantity}
                            className="h-10"
                            disabled
                        />

                        <ArrowRight className="h-10 w-10" />
                        <div className="flex items-center justify-center">
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-10 w-10"
                                onClick={decrease}
                            >
                                <Minus />
                            </Button>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min={0}
                                value={data.quantity}
                                onChange={(e) =>
                                    setData('quantity', Number(e.target.value))
                                }
                                className="h-10"
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-10 w-10"
                                onClick={increase}
                            >
                                <Plus />
                            </Button>
                        </div>
                    </div>

                    <InputError message={errors.quantity} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild disabled={processing}>
                        <Link href={route('stockables.index')}>Cancelar</Link>
                    </Button>

                    <Button disabled={processing}>
                        {processing
                            ? 'Guardando'
                            : `${toAdd > 0 ? 'Agregar' : 'Quitar'} ${Math.abs(toAdd)} unidades`}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
