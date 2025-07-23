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

export function DeleteProductConfirmation({
    product,
    show,
    onClose,
}: {
    product: Product;
    show: boolean;
    onClose: CallableFunction;
}) {
    const { delete: destroy, processing } = useForm();

    const onDestroy = () => {
        destroy(route('products.destroy', { product: product.id }), {
            onFinish: () => onClose(),
        });
    };

    return (
        <AlertDialog open={show} onOpenChange={() => onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar este producto?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    Una vez eliminado, no podrás recuperar los datos de este
                    producto sin intervención de tu administrador.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={processing}
                        onClick={onDestroy}
                    >
                        Eliminar producto
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
