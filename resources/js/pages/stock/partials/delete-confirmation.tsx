import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { AlertDialogContent } from '@radix-ui/react-alert-dialog';

export function DeleteStockableConfirmation({
    stockable,
    show,
    onClose,
}: {
    stockable: Stockable;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(route('stockables.update', { stockable: stockable.id }), {
            onFinish: () => onClose(),
        });
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar este insumo?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    Una vez eliminado, no podrás recuperar los datos de este
                    insumo sin intervención de tu administrador.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar stockeable
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
