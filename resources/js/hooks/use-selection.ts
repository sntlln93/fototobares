import { useState } from 'react';

/**
 * Toggles a single detail in the batch selection.
 */
export const toggleId = (selected: number[], id: number): number[] =>
    selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id];

/**
 * Toggles a whole product group: unselects it when every item is
 * already selected, selects the missing ones otherwise.
 */
export const toggleGroup = (
    selected: number[],
    groupIds: number[],
): number[] => {
    const allSelected = groupIds.every((id) => selected.includes(id));

    return allSelected
        ? selected.filter((id) => !groupIds.includes(id))
        : [...new Set([...selected, ...groupIds])];
};

/**
 * The status right after the given position, if any: the quick-advance
 * button target. Position 0 means production has not started.
 */
export const nextStatusFor = (
    statuses: ProductionStatus[],
    position: number,
): ProductionStatus | undefined =>
    statuses.find((status) => status.position === position + 1);

/**
 * Batch selection state for the tracking table.
 */
export function useSelection() {
    const [selected, setSelected] = useState<number[]>([]);

    return {
        selected,
        toggle: (id: number) => setSelected((prev) => toggleId(prev, id)),
        toggleGroupItems: (ids: number[]) =>
            setSelected((prev) => toggleGroup(prev, ids)),
        clear: () => setSelected([]),
    };
}
