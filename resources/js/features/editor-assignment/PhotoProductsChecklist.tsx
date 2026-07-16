import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PhotoProduct } from './BulkAssignEditorDialog';

export function PhotoProductsChecklist({
    photoProducts,
    selectedIds,
    onChange,
    error,
}: {
    photoProducts: PhotoProduct[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}) {
    const allSelected =
        photoProducts.length > 0 && selectedIds.length === photoProducts.length;

    const toggleAll = (checked: boolean) => {
        onChange(checked ? photoProducts.map((product) => product.id) : []);
    };

    const toggleProduct = (productId: number, checked: boolean) => {
        onChange(
            checked
                ? [...selectedIds, productId]
                : selectedIds.filter((id) => id !== productId),
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Checkbox
                    id="all_products"
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                />
                <Label htmlFor="all_products">Todos los productos</Label>
            </div>

            {photoProducts.map((product) => (
                <div className="flex items-center gap-2" key={product.id}>
                    <Checkbox
                        id={`product_${product.id}`}
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) =>
                            toggleProduct(product.id, checked === true)
                        }
                    />
                    <Label htmlFor={`product_${product.id}`}>
                        {product.name}
                    </Label>
                </div>
            ))}
            <InputError message={error} />
        </div>
    );
}
