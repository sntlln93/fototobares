<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates a variant selection ({label: value|null}) against a product's
 * variant definitions: every non-nullable definition must be present with a
 * value found in its options; nullable definitions may be null or absent;
 * unknown labels or values are rejected.
 */
class VariantSelection implements ValidationRule
{
    /**
     * @param  array<int, array{label: string, type: string, nullable: bool, options: array<int, array{label: string, color?: string|null}>}>  $definitions
     */
    public function __construct(private readonly array $definitions) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            $fail('El valor de :attribute no es válido.');

            return;
        }

        $labels = array_column($this->definitions, 'label');

        foreach (array_keys($value) as $key) {
            if (! in_array($key, $labels, true)) {
                $fail("La variante \"{$key}\" no existe para este producto.");

                return;
            }
        }

        foreach ($this->definitions as $definition) {
            $label = $definition['label'];
            $selected = $value[$label] ?? null;

            if ($selected === null) {
                if (! $definition['nullable']) {
                    $fail("Debes elegir una opción para \"{$label}\".");

                    return;
                }

                continue;
            }

            $optionLabels = array_column($definition['options'], 'label');

            if (! in_array($selected, $optionLabels, true)) {
                $fail("La opción elegida para \"{$label}\" no es válida.");

                return;
            }
        }
    }
}
