import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { capitalize, formatPrice } from '@/lib/utils';
import { Edit, EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
import { CreatePaymentModal } from './payments/create-payment-modal';
import { EditPaymentModal } from './payments/edit-payment-modal';

export function PaymentHistory({
    orderId,
    payments,
}: {
    orderId: Order['id'];
    payments: Payment[];
}) {
    const [showCreatePayment, setShowCreatePayment] = useState(false);
    const [showEditPayment, setShowEditPayment] = useState<Payment | null>(
        null,
    );

    return (
        <>
            <CreatePaymentModal
                orderId={orderId}
                show={showCreatePayment}
                onClose={() => setShowCreatePayment(false)}
            />

            {showEditPayment && (
                <EditPaymentModal
                    payment={showEditPayment}
                    show={!!showEditPayment}
                    onClose={() => setShowEditPayment(null)}
                />
            )}

            <Card className="lg:min-w-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                        <span>Historial de pagos</span>
                        <div className="flex gap-1">
                            <Button
                                size={'sm'}
                                className={'text-xs font-bold uppercase'}
                                onClick={() => setShowCreatePayment(true)}
                            >
                                Registrar pago
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {payments.length ? (
                        payments.map((payment) => (
                            <PaymentItem
                                key={payment.id}
                                payment={payment}
                                onEdit={setShowEditPayment}
                            />
                        ))
                    ) : (
                        <CardDescription className="text-center text-gray-500">
                            Sin pagos registrados
                        </CardDescription>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

function PaymentItem({
    payment,
    onEdit,
}: {
    payment: Payment;
    onEdit: CallableFunction;
}) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 py-4 last:border-0">
            <div className="flex items-center space-x-4">
                <div>
                    <div className="font-semibold text-black">
                        {capitalize(payment.type)}
                    </div>
                    <div className="text-sm text-gray-500">
                        {payment.paid_at}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-black">
                    {formatPrice(payment.amount)}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="h-5 w-5 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                            <Edit /> Editar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
