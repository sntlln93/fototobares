import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
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
import { format } from 'date-fns';
import { FormEventHandler } from 'react';
import { TransactionNumberError } from './transaction-number-error';

const PAYMENT_TYPES = ['efectivo', 'transferencia'] as const;

export function CreatePaymentModal({
    orderId,
    show,
    onClose,
    initialAmount,
}: {
    orderId: Order['id'];
    show: boolean;
    onClose: () => void;
    initialAmount?: number;
}) {
    const { post, data, setData, processing, errors } = useForm<{
        amount: number;
        type: (typeof PAYMENT_TYPES)[number];
        order_id: Order['id'];
        paid_on: string;
        transaction_number: string;
    }>({
        amount: initialAmount ?? 0,
        type: PAYMENT_TYPES[0],
        order_id: orderId,
        paid_on: format(new Date(), 'yyyy-MM-dd'),
        transaction_number: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('payments.store'), {
            onSuccess: () => onClose(),
        });
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
                        onValueChange={(value) => {
                            const type =
                                value as (typeof PAYMENT_TYPES)[number];

                            setData((current) => ({
                                ...current,
                                type,
                                transaction_number:
                                    type === 'transferencia'
                                        ? current.transaction_number
                                        : '',
                            }));
                        }}
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
                    <InputError message={errors.type} />
                </div>

                <div className="mt-2">
                    <Label htmlFor="paid_on">Fecha de pago</Label>
                    <DatePicker
                        date={data.paid_on}
                        setDate={(date) =>
                            setData(
                                'paid_on',
                                format(date ?? new Date(), 'yyyy-MM-dd'),
                            )
                        }
                        disabled={{ after: new Date() }}
                    />
                    <InputError message={errors.paid_on} />
                </div>

                {data.type === 'transferencia' && (
                    <div className="mt-2">
                        <Label htmlFor="transaction_number">
                            Número de transacción
                        </Label>
                        <InputHint
                            className="text-xs"
                            message="El número de referencia de la transferencia (MercadoPago, banco, etc.)"
                        />
                        <Input
                            id="transaction_number"
                            type="text"
                            name="transaction_number"
                            value={data.transaction_number}
                            onChange={(event) =>
                                setData(
                                    'transaction_number',
                                    event.target.value,
                                )
                            }
                            className="mt-1 block w-full"
                        />
                        <TransactionNumberError
                            message={errors.transaction_number}
                        />
                    </div>
                )}

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
