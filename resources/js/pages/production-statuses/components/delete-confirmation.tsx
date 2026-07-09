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
import { toast } from 'sonner';

export function DeleteStatusConfirmation({
    status,
    show,
    onClose,
}: {
    status: ProductionStatus;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(
            route('production-statuses.destroy', {
                productionStatus: status.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(`Etapa "${status.name}" eliminada`),
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo eliminar la etapa',
                    ),
                onFinish: () => onClose(),
            },
        );
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Eliminar la etapa "{status.name}"?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    Las etapas siguientes se reordenan automáticamente. No se
                    puede eliminar una etapa con productos en producción o con
                    insumos configurados.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar etapa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
