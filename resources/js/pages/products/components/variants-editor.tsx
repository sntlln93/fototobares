import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { VARIANT_NAME_SUGGESTIONS } from '../form';
import { ProductFormController } from '../hooks/use-product-form';
import { useVariantDefinitions } from '../hooks/use-variant-definitions';
import { VariantDefinitionFields } from './variant-definition-fields';

export function VariantsEditor({ form }: { form: ProductFormController }) {
    const { data, setData, getVariantError } = form;
    const controller = useVariantDefinitions(data.variants, (variants) =>
        setData('variants', variants),
    );

    return (
        <div className="mt-6">
            <label className="flex items-center gap-2">
                <Checkbox
                    checked={controller.hasVariants}
                    onCheckedChange={() => controller.toggleHasVariants()}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ¿Tiene variantes?
                </span>
            </label>

            {controller.hasVariants && data.variants && (
                <>
                    <datalist id="variant-name-suggestions">
                        {VARIANT_NAME_SUGGESTIONS.map((suggestion) => (
                            <option key={suggestion} value={suggestion} />
                        ))}
                    </datalist>

                    {data.variants.map((definition, index) => (
                        <VariantDefinitionFields
                            key={index}
                            definition={definition}
                            index={index}
                            controller={controller}
                            getError={getVariantError}
                        />
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={controller.addDefinition}
                    >
                        Agregar variante
                    </Button>
                </>
            )}
        </div>
    );
}
