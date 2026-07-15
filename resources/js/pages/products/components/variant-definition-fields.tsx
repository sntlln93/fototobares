import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash } from 'lucide-react';
import { VariantDefinitionsController } from '../hooks/use-variant-definitions';

export function VariantDefinitionFields({
    definition,
    index,
    controller,
    getError,
}: {
    definition: VariantDefinition;
    index: number;
    controller: VariantDefinitionsController;
    getError: (path: string) => string | undefined;
}) {
    return (
        <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <Label htmlFor={`variant-label-${index}`}>Nombre</Label>
                    <Input
                        id={`variant-label-${index}`}
                        list="variant-name-suggestions"
                        value={definition.label}
                        onChange={(e) =>
                            controller.updateDefinition(index, {
                                label: e.target.value,
                            })
                        }
                        className="mt-1"
                    />
                    <InputError
                        message={getError(`variants.${index}.label`)}
                        className="mt-2"
                    />
                </div>

                <div className="w-40">
                    <Label htmlFor={`variant-type-${index}`}>Tipo</Label>
                    <Select
                        value={definition.type}
                        onValueChange={(value) =>
                            controller.updateDefinition(index, {
                                type: value as VariantType,
                            })
                        }
                    >
                        <SelectTrigger
                            id={`variant-type-${index}`}
                            className="mt-1"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-6"
                    onClick={() => controller.removeDefinition(index)}
                >
                    <Trash />
                </Button>
            </div>

            <label className="mt-3 flex items-center gap-2">
                <Checkbox
                    checked={definition.nullable}
                    onCheckedChange={(checked) =>
                        controller.updateDefinition(index, {
                            nullable: checked === true,
                        })
                    }
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Se puede definir después
                </span>
            </label>

            <div className="mt-4 space-y-2">
                <Label>Opciones</Label>
                {definition.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                            value={option.label}
                            onChange={(e) =>
                                controller.updateOption(index, optionIndex, {
                                    label: e.target.value,
                                })
                            }
                            placeholder="Nombre de la opción"
                        />
                        {definition.type === 'color' && (
                            <input
                                type="color"
                                value={option.color ?? '#000000'}
                                onChange={(e) =>
                                    controller.updateOption(
                                        index,
                                        optionIndex,
                                        { color: e.target.value },
                                    )
                                }
                                className="h-9 w-12 rounded border border-input"
                            />
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                controller.removeOption(index, optionIndex)
                            }
                        >
                            <Trash />
                        </Button>
                    </div>
                ))}
                <InputError
                    message={getError(`variants.${index}.options`)}
                    className="mt-2"
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => controller.addOption(index)}
                >
                    Agregar opción
                </Button>
            </div>
        </div>
    );
}
