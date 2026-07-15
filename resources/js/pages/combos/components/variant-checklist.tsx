import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import { ChangeEvent } from 'react';

interface VariantChecklistProps<T extends string> {
    legend: string;
    options: readonly T[];
    selected: Set<T>;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    renderLabel?: (value: T) => string;
    swatchFor?: (value: T) => string | undefined;
}

export function VariantChecklist<T extends string>({
    legend,
    options,
    selected,
    onChange,
    error,
    renderLabel,
    swatchFor,
}: VariantChecklistProps<T>) {
    return (
        <div className="mt-6">
            <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {legend}
                </legend>
                {options.map((option) => (
                    <label className="flex items-center" key={option}>
                        <Checkbox
                            value={option}
                            checked={selected.has(option)}
                            onChange={onChange}
                        />
                        {swatchFor?.(option) && (
                            <span
                                className="ms-2 h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: swatchFor(option) }}
                            />
                        )}
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            {renderLabel ? renderLabel(option) : option}
                        </span>
                    </label>
                ))}
            </fieldset>
            <InputError message={error} className="mt-2" />
        </div>
    );
}
