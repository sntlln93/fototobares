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
import { downloadPaymentReceipt } from '@/lib/receipt';
import { capitalize, formatPrice } from '@/lib/utils';
import {
    Edit,
    EllipsisVertical,
    ImageDown,
    Paperclip,
    Share2,
} from 'lucide-react';
import { useState } from 'react';
import { useShareReceipt } from '../hooks/use-share-receipt';
import { CreatePaymentModal } from './create-payment-modal';
import { EditPaymentModal } from './edit-payment-modal';

export function PaymentHistory({
    order,
    payments,
    showCreatePayment,
    setShowCreatePayment,
    initialAmount,
    canRegister = true,
}: {
    order: Order;
    payments: Payment[];
    showCreatePayment: boolean;
    setShowCreatePayment: (show: boolean) => void;
    initialAmount?: number | null;
    canRegister?: boolean;
}) {
    const [showEditPayment, setShowEditPayment] = useState<Payment | null>(
        null,
    );

    return (
        <>
            {showCreatePayment && (
                <CreatePaymentModal
                    orderId={order.id}
                    show={showCreatePayment}
                    initialAmount={initialAmount ?? undefined}
                    onClose={() => setShowCreatePayment(false)}
                />
            )}

            {showEditPayment && (
                <EditPaymentModal
                    payment={showEditPayment}
                    show={!!showEditPayment}
                    onClose={() => setShowEditPayment(null)}
                />
            )}

            <Card className="lg:min-w-100">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-xl">
                        <span>Historial de pagos</span>
                        {canRegister && (
                            <div className="flex gap-1">
                                <Button
                                    size={'sm'}
                                    className={'text-xs font-bold uppercase'}
                                    onClick={() => setShowCreatePayment(true)}
                                >
                                    Registrar pago
                                </Button>
                            </div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {payments.length ? (
                        payments.map((payment) => (
                            <PaymentItem
                                key={payment.id}
                                payment={payment}
                                order={order}
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
    order,
    onEdit,
}: {
    payment: Payment;
    order: Order;
    onEdit: (payment: Payment) => void;
}) {
    const { share, sharing } = useShareReceipt();

    return (
        <div className="flex items-center justify-between border-b border-gray-200 py-4 last:border-0 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <div>
                    <div className="flex items-center gap-1 font-semibold text-black dark:text-white">
                        {capitalize(payment.type)}
                        {payment.proof_of_payment && (
                            <a
                                href={payment.proof_of_payment}
                                target="_blank"
                                rel="noreferrer"
                                title="Ver comprobante de transferencia adjunto"
                            >
                                <Paperclip className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </a>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.paid_at}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-black dark:text-white">
                    {formatPrice(payment.amount)}
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    title="Descargar comprobante de Fototobares (imagen)"
                    onClick={() =>
                        void downloadPaymentReceipt({ payment, order })
                    }
                >
                    <ImageDown className="h-5 w-5" />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    title="Compartir comprobante por WhatsApp"
                    disabled={sharing}
                    onClick={() => void share({ payment, order })}
                >
                    <Share2 className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="h-5 w-5 text-gray-400 dark:text-gray-600" />
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
