import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function StageRollbackConfirmation({
    show,
    productName,
    stepsBack,
    targetName,
    onConfirm,
    onCancel,
}: {
    show: boolean;
    productName: string;
    stepsBack: number;
    targetName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <AlertDialog open={show} onOpenChange={() => onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés retroceder {productName}{' '}
                        {stepsBack} etapa{stepsBack === 1 ? '' : 's'} hacia{' '}
                        {targetName}?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancelar
                    </AlertDialogCancel>

                    <AlertDialogAction onClick={onConfirm}>
                        Retroceder
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
