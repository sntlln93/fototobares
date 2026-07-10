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

export function DeleteSchoolConfirmation({
    school,
    show,
    onClose,
}: {
    school: School;
    show: boolean;
    onClose: () => void;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(route('schools.destroy', { school: school.id }), {
            onFinish: () => onClose(),
        });
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar esta escuela?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Una vez eliminada, también se eliminarán los datos
                        asociados a esta. No podrás recuperar los datos de esta
                        escuela sin intervención de tu administrador.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar escuela
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
