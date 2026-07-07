import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

export function DeleteOrderConfirmation({
    order,
    show,
    onClose,
}: {
    order: Order;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(route('orders.destroy', { order: order.id }), {
            onFinish: () => onClose(),
        });
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar este pedido?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    Una vez eliminado, no podrás recuperar los datos de este
                    pedido sin intervención de tu administrador.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar pedido
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
