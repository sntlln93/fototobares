import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductOrder, SelectableProduct } from '../form';
import { useAddDetail } from '../hooks/use-add-detail';
import { DetailVariantField } from './detail-variant-field';

export function AddDetail({
    addProducts,
    products,
    show,
    onClose,
    initialValues,
}: {
    addProducts: (products: ProductOrder[]) => void;
    products: SelectableProduct[];
    show: boolean;
    onClose: () => void;
    /** Existing values (aligned with `products`) when editing an added product */
    initialValues?: ProductOrder[];
}) {
    const {
        errors,
        currentStep,
        getVariantValue,
        setVariantValue,
        getNote,
        setNote,
        handleAddProduct,
        handleNextStep,
        handlePreviousStep,
        getDefinitions,
    } = useAddDetail({ products, addProducts, onClose, initialValues });

    const product = products[currentStep];
    const definitions = getDefinitions(currentStep);

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6" key={product.id}>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar {product.name} al pedido
                </h2>

                <h3 className="text-md font-medium text-gray-500 dark:text-gray-100">
                    Agregando {currentStep + 1} de {products.length} productos
                </h3>

                {definitions.map((definition) => (
                    <DetailVariantField
                        key={definition.label}
                        definition={definition}
                        value={getVariantValue(product.id, definition.label)}
                        onSelect={(value) =>
                            setVariantValue(product.id, definition.label, value)
                        }
                        error={errors[product.id]?.[definition.label]}
                    />
                ))}

                <div className="mt-2">
                    <Label htmlFor="note">Notas</Label>
                    <InputHint
                        className="text-xs"
                        message="Nombre que va en la foto u otra información que deba estar impresa en este producto"
                    />

                    <Input
                        id="note"
                        type="text"
                        name="note"
                        value={getNote(product.id)}
                        onChange={(e) => setNote(product.id, e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError
                        message={errors[product.id]?.note}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    {currentStep > 0 ? (
                        <Button
                            variant="secondary"
                            onClick={handlePreviousStep}
                        >
                            Atrás
                        </Button>
                    ) : undefined}

                    <Button variant="outline" onClick={() => onClose()}>
                        Cancelar
                    </Button>

                    {currentStep === products.length - 1 ? (
                        <Button onClick={handleAddProduct}>
                            Agregar {products.length} producto
                            {products.length > 1 ? 's' : ''} al pedido
                        </Button>
                    ) : (
                        <Button onClick={handleNextStep}>Siguiente</Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
