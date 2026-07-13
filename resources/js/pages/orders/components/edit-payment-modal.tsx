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

export function EditPaymentModal({
    payment,
    show,
    onClose,
}: {
    payment: Payment;
    show: boolean;
    onClose: () => void;
}) {
    const { put, data, setData, processing, errors } = useForm<{
        amount: number;
        type: string;
        order_id: number;
        paid_on: string;
        transaction_number: string;
    }>({
        amount: payment.amount,
        type: payment.type,
        order_id: payment.order_id,
        paid_on: payment.paid_on,
        transaction_number: payment.transaction_number ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('payments.update', payment.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Modificar pago #{payment.id} para pedido #{payment.order_id}
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
                        date={new Date(data.paid_on)}
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
                        {processing ? <Spinner /> : 'Modificar pago'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
