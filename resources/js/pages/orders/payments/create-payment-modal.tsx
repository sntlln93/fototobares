import InputError from '@/components/input-error';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { capitalize } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const PAYMENT_TYPES = ['efectivo', 'transferencia'] as const;

export function CreatePaymentModal({
    orderId,
    show,
    onClose,
}: {
    orderId: Order['id'];
    show: boolean;
    onClose: CallableFunction;
}) {
    const { post, data, setData, processing, errors } = useForm<{
        amount: number;
        type: (typeof PAYMENT_TYPES)[number];
        order_id: Order['id'];
    }>({
        amount: 0,
        type: PAYMENT_TYPES[0],
        order_id: orderId,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('payments.store'));

        onClose();
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Registrar pago para pedido #{orderId}
                </h2>

                <div className="mt-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                        id="amount"
                        type="number"
                        name="amount"
                        value={data.amount}
                        onChange={(event) =>
                            setData('amount', Number(event.target.value))
                        }
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.amount} />
                </div>

                <div className="mt-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                        value={PAYMENT_TYPES.find((type) => type === data.type)}
                        name="type"
                        onValueChange={(value) =>
                            setData(
                                'type',
                                value as (typeof PAYMENT_TYPES)[number],
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_TYPES.map((payment) => (
                                <SelectItem value={payment} key={payment}>
                                    {capitalize(payment)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.amount} />
                </div>

                <div className="mt-6 grid grid-cols-[1fr_1fr] gap-2">
                    <Button
                        disabled={processing}
                        variant="outline"
                        onClick={() => onClose()}
                    >
                        Cancelar
                    </Button>

                    <Button disabled={processing}>
                        {processing ? <Spinner /> : 'Registrar pago'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
