import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { getColorEs } from '@/lib/utils';
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
    const {
        orientations,
        photoTypes,
        backgrounds,
        colors,
        errors,
        handleSetOrientations,
        handleSetPhotoTypes,
        handleSetBackgrounds,
        handleSetColors,
        handleAddProduct,
    } = useAddProduct({ product, initialVariants, addProduct, onClose });

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {initialVariants ? 'Editar' : 'Agregar'} {product.name}
                    {product.variants?.dimentions
                        ? ` (${product.variants.dimentions})`
                        : ''}{' '}
                    {initialVariants ? 'del' : 'al'} combo
                </h2>

                <VariantChecklist
                    legend="Orientaciones disponibles para este producto"
                    options={product.variants?.orientations ?? []}
                    selected={orientations}
                    onChange={handleSetOrientations}
                    error={errors?.orientations}
                />

                <VariantChecklist
                    legend="Tipo de foto"
                    options={product.variants?.photo_types ?? []}
                    selected={photoTypes}
                    onChange={handleSetPhotoTypes}
                    error={errors?.photoTypes}
                />

                <VariantChecklist
                    legend="Fondos disponibles para este combo"
                    options={product.variants?.backgrounds ?? []}
                    selected={backgrounds}
                    onChange={handleSetBackgrounds}
                    error={errors?.backgrounds}
                />

                <VariantChecklist
                    legend="Colores disponibles para este combo"
                    options={product.variants?.colors ?? []}
                    selected={colors}
                    onChange={handleSetColors}
                    error={errors?.colors}
                    renderLabel={getColorEs}
                />

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
