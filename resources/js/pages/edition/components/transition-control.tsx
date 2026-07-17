import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
 * actor — `allowed_targets` already reflects role/assignment gating, so an
 * empty list (nothing reachable) simply renders nothing.
 */
export function TransitionControl({
    orderDetailId,
    allowedTargets,
}: {
    orderDetailId: number;
    allowedTargets: EditingStatusValue[];
}) {
    const { transition } = useEditingStatusTransition();

    if (allowedTargets.length === 0) {
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
        </div>
    );
}
