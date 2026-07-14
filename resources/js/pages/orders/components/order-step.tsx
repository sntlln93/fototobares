import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { OrderFormController } from '../hooks/use-create-order-form';
import { PriceBreakdown } from './price-breakdown';

export function OrderStep({ form }: { form: OrderFormController }) {
    const {
        data,
        setData,
        errors,
        errorFlags,
        breakdown,
        recalculatePrice,
        processing,
        toStep,
        submit,
        handleSaveAsDraft,
        handleSaveAndContinue,
    } = form;

    const adjustedByHand = Number(data.total_price) !== breakdown.total;

    return (
        <AccordionItem value="order">
            <AccordionTrigger onClick={toStep('order')}>
                <div className="flex items-center gap-2">
                    {errorFlags['products'] && (
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
                        onChange={(e) => setData('total_price', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.total_price} />

                    <PriceBreakdown
                        breakdown={breakdown}
                        adjustedByHand={adjustedByHand}
                        onRecalculate={recalculatePrice}
                    />
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
                            date={data.due_date}
                            setDate={(date) =>
                                setData(
                                    'due_date',
                                    format(date ?? new Date(), 'yyyy-MM-dd'),
                                )
                            }
                        />
                    </div>

                    <InputError className="mt-2" message={errors.due_date} />
                </div>

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    <Button variant="outline" asChild>
                        <Link href={route('orders.index')}>Cancelar</Link>
                    </Button>

                    <Button
                        variant="outline"
                        disabled={processing}
                        onClick={handleSaveAsDraft}
                    >
                        Guardar como borrador
                    </Button>

                    <Button
                        variant="secondary"
                        disabled={processing}
                        onClick={submit}
                    >
                        Guardar
                    </Button>

                    <Button
                        disabled={processing}
                        onClick={handleSaveAndContinue}
                    >
                        Guardar y seguir vendiendo
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
