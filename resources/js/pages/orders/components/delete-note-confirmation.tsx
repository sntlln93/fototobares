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

export function DeleteNoteConfirmation({
    note,
    show,
    onClose,
}: {
    note: Note;
    show: boolean;
    onClose: () => void;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(route('notes.destroy', { note: note.id }), {
            preserveScroll: true,
            onFinish: () => onClose(),
        });
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar esta nota?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    Una vez eliminada, no podrás recuperarla.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar nota
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
