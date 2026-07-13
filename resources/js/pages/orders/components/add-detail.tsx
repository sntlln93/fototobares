import InputError from '@/components/input-error';
import InputHint from '@/components/input-hint';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { capitalize, getColorEs } from '@/lib/utils';
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
        getProductValue,
        updateProductData,
        handleAddProduct,
        handleNextStep,
        handlePreviousStep,
        getVariants,
    } = useAddDetail({ products, addProducts, onClose, initialValues });

    const product = products[currentStep];
    // Narrowed once so TypeScript knows the variants exist inside the block
    const currentVariants = getVariants(currentStep);

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6" key={product.id}>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Agregar {product.name} al pedido
                </h2>

                <h3 className="text-md font-medium text-gray-500 dark:text-gray-100">
                    Agregando {currentStep + 1} de {products.length} productos
                </h3>

                {product.product_type_id === 1 && currentVariants ? (
                    <>
                        <DetailVariantField
                            legend="Orientaciones disponibles para este producto"
                            options={currentVariants.orientations}
                            selectedValue={getProductValue(
                                product.id,
                                'orientation',
                            )}
                            onSelect={(value) =>
                                updateProductData(
                                    'orientation',
                                    product.id,
                                    value as ProductOrientation,
                                )
                            }
                            renderLabel={capitalize}
                            error={errors[product.id]?.orientation}
                        />

                        <DetailVariantField
                            legend="Tipo de foto"
                            options={currentVariants.photo_types}
                            selectedValue={getProductValue(
                                product.id,
                                'photoType',
                            )}
                            onSelect={(value) =>
                                updateProductData(
                                    'photoType',
                                    product.id,
                                    value as ProductPhotoType,
                                )
                            }
                            renderLabel={capitalize}
                            error={errors[product.id]?.photoType}
                        />

                        <DetailVariantField
                            legend="Fondos disponibles para este producto en este combo"
                            options={currentVariants.backgrounds}
                            selectedValue={getProductValue(
                                product.id,
                                'background',
                            )}
                            onSelect={(value) =>
                                updateProductData(
                                    'background',
                                    product.id,
                                    value,
                                )
                            }
                            renderLabel={getColorEs}
                            error={errors[product.id]?.background}
                        />

                        <DetailVariantField
                            legend="Colores disponibles para este producto en este combo"
                            options={currentVariants.colors}
                            selectedValue={getProductValue(product.id, 'color')}
                            onSelect={(value) =>
                                updateProductData('color', product.id, value)
                            }
                            renderLabel={getColorEs}
                            error={errors[product.id]?.color}
                        />
                    </>
                ) : undefined}

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
                        value={getProductValue(product.id, 'note') ?? ''}
                        onChange={(e) =>
                            updateProductData(
                                'note',
                                product.id,
                                e.target.value,
                            )
                        }
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
