export function emptyVariantDefinition(): VariantDefinition {
    return {
        label: '',
        type: 'text',
        nullable: false,
        options: [{ label: '' }],
    };
}

/**
 * Add/remove/update for a product's variant definitions and their options.
 * Flipping a definition's type to "text" drops any colors its options had,
 * since they no longer apply.
 */
export function useVariantDefinitions(
    variants: VariantDefinition[] | null,
    onChange: (variants: VariantDefinition[] | null) => void,
) {
    const toggleHasVariants = () => {
        onChange(variants === null ? [emptyVariantDefinition()] : null);
    };

    const addDefinition = () => {
        onChange([...(variants ?? []), emptyVariantDefinition()]);
    };

    const removeDefinition = (index: number) => {
        onChange((variants ?? []).filter((_, i) => i !== index));
    };

    const updateDefinition = (
        index: number,
        patch: Partial<VariantDefinition>,
    ) => {
        onChange(
            (variants ?? []).map((definition, i) => {
                if (i !== index) {
                    return definition;
                }

                const updated = { ...definition, ...patch };

                if (patch.type === 'text') {
                    updated.options = updated.options.map((option) => ({
                        label: option.label,
                    }));
                }

                return updated;
            }),
        );
    };

    const addOption = (definitionIndex: number) => {
        onChange(
            (variants ?? []).map((definition, i) =>
                i === definitionIndex
                    ? {
                          ...definition,
                          options: [...definition.options, { label: '' }],
                      }
                    : definition,
            ),
        );
    };

    const removeOption = (definitionIndex: number, optionIndex: number) => {
        onChange(
            (variants ?? []).map((definition, i) =>
                i === definitionIndex
                    ? {
                          ...definition,
                          options: definition.options.filter(
                              (_, oi) => oi !== optionIndex,
                          ),
                      }
                    : definition,
            ),
        );
    };

    const updateOption = (
        definitionIndex: number,
        optionIndex: number,
        patch: Partial<VariantOption>,
    ) => {
        onChange(
            (variants ?? []).map((definition, i) =>
                i === definitionIndex
                    ? {
                          ...definition,
                          options: definition.options.map((option, oi) =>
                              oi === optionIndex
                                  ? { ...option, ...patch }
                                  : option,
                          ),
                      }
                    : definition,
            ),
        );
    };

    return {
        hasVariants: variants !== null,
        toggleHasVariants,
        addDefinition,
        removeDefinition,
        updateDefinition,
        addOption,
        removeOption,
        updateOption,
    };
}

export type VariantDefinitionsController = ReturnType<
    typeof useVariantDefinitions
>;
