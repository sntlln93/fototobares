import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { backgrounds, colors, orientations, photo_types } from '../form';
import { ProductFormController } from '../hooks/use-product-form';
import { VariantCheckboxGroup } from './variant-checkbox-group';

export function ProductVariantsFields({
    form,
    renderColorLabel = (value) => value,
}: {
    form: ProductFormController;
    renderColorLabel?: (value: Color) => string;
}) {
    const { data, setData, setVariant, getVariantError } = form;

    return (
        <>
            <div className="mt-6">
                <Label htmlFor="dimentions">Medidas (ancho x alto)</Label>
                <Input
                    id="dimentions"
                    name="variants.dimentions"
                    min={0}
                    value={data.variants.dimentions}
                    onChange={(e) =>
                        setData('variants', {
                            ...data.variants,
                            dimentions: e.target.value,
                        })
                    }
                    className="mt-1 block w-full"
                    placeholder="Cantidad en números enteros"
                />

                <InputError
                    message={getVariantError('variants.dimentions')}
                    className="mt-2"
                />
            </div>

            <VariantCheckboxGroup
                legend="Orientaciones disponibles para este producto"
                options={orientations}
                selected={data.variants.orientations}
                onChange={(value) => setVariant('orientations', value)}
                errorMessage={getVariantError('variants.orientations')}
            />

            <VariantCheckboxGroup
                legend="Colores disponibles para este producto"
                options={colors}
                selected={data.variants.colors}
                onChange={(value) => setVariant('colors', value)}
                errorMessage={getVariantError('variants.colors')}
                renderLabel={renderColorLabel}
            />

            <VariantCheckboxGroup
                legend="Fondos disponibles para este producto"
                options={backgrounds}
                selected={data.variants.backgrounds}
                onChange={(value) => setVariant('backgrounds', value)}
                errorMessage={getVariantError('variants.backgrounds')}
                renderLabel={renderColorLabel}
            />

            <VariantCheckboxGroup
                legend="Tipo de foto"
                options={photo_types}
                selected={data.variants.photo_types}
                onChange={(value) => setVariant('photo_types', value)}
                errorMessage={getVariantError('variants.photo_types')}
            />
        </>
    );
}
