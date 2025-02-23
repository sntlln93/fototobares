import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('products.destroy', { product: product.id }), {
            onFinish: () => {
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    ¿Estás seguro que querés eliminar este producto?
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Una vez eliminado, no podrás recuperar los datos de este
                    producto sin intervención de tu administrador.
                </p>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => onClose()}>
                        Cancelar
                    </Button>

                    <Button
                        className="ms-3"
                        variant="destructive"
                        disabled={processing}
                    >
                        Eliminar producto
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
