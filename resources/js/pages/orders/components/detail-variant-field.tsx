import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';

interface DetailVariantFieldProps {
    legend: string;
    options: readonly string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    renderLabel: (value: string) => string;
    error?: string;
}

export function DetailVariantField({
    legend,
    options,
    selectedValue,
    onSelect,
    renderLabel,
    error,
}: DetailVariantFieldProps) {
    return (
        <div className="mt-2">
            <fieldset>
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {legend}
                </legend>
                <div className="mt-1 flex flex-wrap gap-4">
                    {options.map((option) => (
                        <label className="flex items-center" key={option}>
                            <Checkbox
                                value={option}
                                checked={selectedValue === option}
                                onChange={(e) => onSelect(e.target.value)}
                            />
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                {renderLabel(option)}
                            </span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <InputError message={error} className="mt-2" />
        </div>
    );
}
