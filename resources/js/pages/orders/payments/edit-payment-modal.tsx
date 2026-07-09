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
import { FormEventHandler } from 'react';

const PAYMENT_TYPES = ['efectivo', 'transferencia'] as const;

export function EditPaymentModal({
    payment,
    show,
    onClose,
}: {
    payment: Payment;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { post, data, setData, processing, errors } = useForm<{
        amount: number;
        type: string;
        order_id: number;
        proof_of_payment: File | null;
        _method: 'put';
    }>({
        amount: payment.amount,
        type: payment.type,
        order_id: payment.order_id,
        proof_of_payment: null,
        _method: 'put',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Method spoofing: multipart/form-data does not work with PUT
        post(route('payments.update', payment.id), {
            forceFormData: true,
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
                                proof_of_payment:
                                    type === 'transferencia'
                                        ? current.proof_of_payment
                                        : null,
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

                {data.type === 'transferencia' && (
                    <div className="mt-2">
                        <Label htmlFor="proof_of_payment">
                            Comprobante de transferencia (opcional)
                        </Label>
                        <InputHint
                            className="text-xs"
                            message={
                                payment.proof_of_payment
                                    ? 'Si adjuntás un archivo nuevo, reemplaza al actual'
                                    : 'Imagen o PDF de hasta 5MB (MercadoPago, banco, etc.)'
                            }
                        />
                        <Input
                            id="proof_of_payment"
                            type="file"
                            name="proof_of_payment"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={(event) =>
                                setData(
                                    'proof_of_payment',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.proof_of_payment} />
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
