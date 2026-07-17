import { Button } from '@/components/ui/button';
import { ArrowRight, Undo2 } from 'lucide-react';
import { useEditingStatusTransition } from '../hooks/use-editing-status-transition';
import { EditingStatusValue } from './classroom-table';

const TARGET_LABELS: Record<EditingStatusValue, string> = {
    pendiente: 'Pendiente',
    editada: 'Editada',
    ok: 'Ok',
    a_corregir: 'A corregir',
};

/**
 * Renders one button per legal target status for the current row and
 * actor — `allowed_targets` already reflects role/assignment gating — plus,
 * for the author of the row's latest transition, a button to revert it
 * (`canRevert`). Renders nothing only when there is neither a legal target
 * nor a revert available.
 */
export function TransitionControl({
    orderDetailId,
    allowedTargets,
    canRevert,
}: {
    orderDetailId: number;
    allowedTargets: EditingStatusValue[];
    canRevert: boolean;
}) {
    const { transition, revert } = useEditingStatusTransition();

    if (allowedTargets.length === 0 && !canRevert) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {allowedTargets.map((target) => (
                <Button
                    key={target}
                    size="sm"
                    variant="outline"
                    title={`Pasar a "${TARGET_LABELS[target]}"`}
                    onClick={() => transition(orderDetailId, target)}
                >
                    {TARGET_LABELS[target]}
                    <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            ))}
            {canRevert && (
                <Button
                    size="sm"
                    variant="ghost"
                    title="Revertir última transición"
                    onClick={() => revert(orderDetailId)}
                >
                    <Undo2 className="mr-1 h-3 w-3" />
                    Revertir
                </Button>
            )}
        </div>
    );
}
