import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { SelectedProduct } from '../form';
import { useAddProduct } from '../hooks/use-add-product';
import { VariantChecklist } from './variant-checklist';

export function AddProduct({
    addProduct,
    product,
    show,
    onClose,
    initialVariants,
}: {
    addProduct: (product: SelectedProduct) => void;
    product: Product;
    show: boolean;
    onClose: () => void;
    /** Existing selection when editing a product already in the combo */
    initialVariants?: SelectedProduct['variants'] | null;
}) {
    const { selection, errors, toggleOption, handleAddProduct } = useAddProduct(
        { product, initialVariants, addProduct, onClose },
    );

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {initialVariants ? 'Editar' : 'Agregar'} {product.name}{' '}
                    {initialVariants ? 'del' : 'al'} combo
                </h2>

                {(product.variants ?? []).map((definition) => (
                    <VariantChecklist
                        key={definition.label}
                        legend={`${definition.label} disponibles para este combo`}
                        options={definition.options.map(
                            (option) => option.label,
                        )}
                        selected={selection[definition.label] ?? new Set()}
                        onChange={toggleOption(definition.label)}
                        error={errors[definition.label]}
                        swatchFor={
                            definition.type === 'color'
                                ? (label) =>
                                      definition.options.find(
                                          (option) => option.label === label,
                                      )?.color
                                : undefined
                        }
                    />
                ))}

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => onClose()}>
                        Cancelar
                    </Button>

                    <Button className="ms-3" onClick={handleAddProduct}>
                        Agregar {product.name}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
