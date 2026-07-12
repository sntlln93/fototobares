import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface DeliveryWarningModalProps {
    show: boolean;
    balance: number;
    onClose: () => void;
    onPayBalance: () => void;
    onConfirm: () => void;
}

export function DeliveryWarningModal({
    show,
    balance,
    onClose,
    onPayBalance,
    onConfirm,
}: DeliveryWarningModalProps) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Este pedido no está pagado al 100%
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Queda un saldo pendiente de{' '}
                    <strong>{formatPrice(balance)}</strong>. Podés cancelar el
                    saldo ahora o entregar de todas formas.
                </p>

                <div className="mt-6 flex flex-col justify-end gap-2 md:flex-row">
                    <Button variant="outline" onClick={onClose}>
                        Volver
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onClose();
                            onPayBalance();
                        }}
                    >
                        Cancelar saldo ({formatPrice(balance)})
                    </Button>
                    <Button onClick={onConfirm}>Entregar igualmente</Button>
                </div>
            </div>
        </Modal>
    );
}
