import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

export function DetailVariantField({
    definition,
    value,
    onSelect,
    error,
}: {
    definition: VariantDefinition;
    value: string | null;
    onSelect: (value: string | null) => void;
    error?: string;
}) {
    return (
        <div className="mt-2">
            <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {definition.label}
                </legend>
                <div className="mt-1 flex flex-wrap gap-2">
                    {definition.options.map((option) => (
                        <button
                            type="button"
                            key={option.label}
                            onClick={() => onSelect(option.label)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm',
                                value === option.label
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input text-gray-600 dark:text-gray-400',
                            )}
                        >
                            {option.color && (
                                <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: option.color }}
                                />
                            )}
                            {option.label}
                        </button>
                    ))}

                    {definition.nullable && (
                        <button
                            type="button"
                            onClick={() => onSelect(null)}
                            className={cn(
                                'rounded-full border px-3 py-1 text-sm',
                                value === null
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-dashed border-input text-gray-500 dark:text-gray-400',
                            )}
                        >
                            Definir después
                        </button>
                    )}
                </div>
            </fieldset>
            <InputError message={error} className="mt-2" />
        </div>
    );
}
