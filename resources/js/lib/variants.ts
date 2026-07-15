/**
 * A product's variant definitions restricted by the combo pivot's subset
 * (intersection by option label), when the product came from a combo that
 * restricts it. Without a pivot subset, the product's own definitions apply
 * as-is.
 */
export function resolveVariantDefinitions(product: {
    variants?: VariantDefinition[] | null;
    pivot?: { variants?: ComboVariantSubset | null } | null;
}): VariantDefinition[] {
    const definitions = product.variants ?? [];
    const subset = product.pivot?.variants;

    if (!subset) {
        return definitions;
    }

    return definitions.map((definition) => {
        const allowed = subset[definition.label];

        return allowed
            ? {
                  ...definition,
                  options: definition.options.filter((option) =>
                      allowed.includes(option.label),
                  ),
              }
            : definition;
    });
}

/** Rebuilds the client selection a stored snapshot came from, for editing. */
export function selectionFromSnapshot(
    snapshot: VariantSnapshotEntry[] | null | undefined,
): VariantSelection {
    return Object.fromEntries(
        (snapshot ?? []).map((entry) => [
            entry.label,
            entry.value?.label ?? null,
        ]),
    );
}

/**
 * Client-side preview of the snapshot the backend will build, for showing a
 * cart item before the order is submitted. The backend always rebuilds it
 * from the product definitions server-side; this is display-only.
 */
export function snapshotFromSelection(
    definitions: VariantDefinition[],
    selection: VariantSelection,
): VariantSnapshotEntry[] {
    return definitions.map((definition) => {
        const selectedLabel = selection[definition.label] ?? null;
        const option =
            selectedLabel !== null
                ? (definition.options.find(
                      (candidate) => candidate.label === selectedLabel,
                  ) ?? null)
                : null;

        return {
            label: definition.label,
            type: definition.type,
            value: option ? { label: option.label, color: option.color } : null,
        };
    });
}

export function variantSummary(
    snapshot: VariantSnapshotEntry[] | null | undefined,
): string {
    return (snapshot ?? [])
        .map((entry) =>
            entry.value ? entry.value.label : `${entry.label}: a definir`,
        )
        .join(' · ');
}

export function hasPendingVariants(
    snapshot: VariantSnapshotEntry[] | null | undefined,
): boolean {
    return (snapshot ?? []).some((entry) => entry.value === null);
}
