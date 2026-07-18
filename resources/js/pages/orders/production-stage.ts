/**
 * Detects whether a production status change is a rollback (moving to an
 * earlier stage) and, if so, how many stages back it goes.
 *
 * `statuses` must already be ordered by position. `null` represents
 * "Sin empezar", which is treated as the stage before the first one.
 */
export function getStageRollback(
    statuses: ProductionStatus[],
    currentStatusId: number | null | undefined,
    targetStatusId: number | null,
): { isRollback: boolean; stepsBack: number; targetName: string } {
    const indexOf = (statusId: number | null | undefined) =>
        statusId == null
            ? -1
            : statuses.findIndex((status) => status.id === statusId);

    const currentIndex = indexOf(currentStatusId);
    const targetIndex = indexOf(targetStatusId);

    const isRollback = targetIndex < currentIndex;
    const stepsBack = currentIndex - targetIndex;
    const targetName =
        targetStatusId == null ? 'Sin empezar' : statuses[targetIndex].name;

    return { isRollback, stepsBack, targetName };
}
