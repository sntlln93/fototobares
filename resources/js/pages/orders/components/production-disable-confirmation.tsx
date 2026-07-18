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

export function ProductionDisableConfirmation({
    show,
    productName,
    onConfirm,
    onCancel,
}: {
    show: boolean;
    productName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <AlertDialog open={show} onOpenChange={() => onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Deshabilitar la fabricación de {productName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        El producto dejará de aparecer en /tracking. La etapa
                        alcanzada se conserva para retomarla al volver a
                        habilitar la fabricación, y no se revierte stock.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction onClick={onConfirm}>
                        Deshabilitar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
