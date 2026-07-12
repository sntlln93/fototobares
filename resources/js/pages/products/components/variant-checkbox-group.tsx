import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import { ChangeEvent } from 'react';

export function VariantCheckboxGroup<T extends string>({
    legend,
    options,
    selected,
    onChange,
    errorMessage,
    renderLabel = (value) => value,
}: {
    legend: string;
    options: readonly T[];
    selected: T[];
    onChange: (value: T) => (e: ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
    renderLabel?: (value: T) => string;
}) {
    return (
        <div className="mt-6">
            <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {legend}
                </legend>
                {options.map((option) => (
                    <label className="flex items-center" key={option}>
                        <Checkbox
                            name={option}
                            checked={selected.includes(option)}
                            onChange={onChange(option)}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            {renderLabel(option)}
                        </span>
                    </label>
                ))}
            </fieldset>
            <InputError message={errorMessage} className="mt-2" />
        </div>
    );
}
