import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Factory } from 'lucide-react';
import { useState } from 'react';
import { getStageRollback } from '../production-stage';
import { StageRollbackConfirmation } from './stage-rollback-confirmation';

const PENDING = 'none';

/**
 * Production status of a detail, editable from the order page (#106).
 * Production is gated by the first installment: until it is paid the
 * detail stays out of /tracking and this control only explains why.
 */
export function ProductionStatusControl({
    product,
    firstInstallmentPaid,
    onChange,
}: {
    product: OrderProduct;
    firstInstallmentPaid: boolean;
    onChange: (statusId: number | null) => void;
}) {
    const [pendingRollback, setPendingRollback] = useState<{
        targetId: number | null;
        stepsBack: number;
        targetName: string;
    } | null>(null);

    if (!product.production_enabled) {
        if (!firstInstallmentPaid) {
            return (
                <p className="mt-2 text-xs text-muted-foreground">
                    La fabricación se habilita cuando la primera cuota está
                    paga.
                </p>
            );
        }

        return (
            <Button
                variant="outline"
                size="sm"
                className="mt-2 h-auto px-2 py-1 text-xs"
                onClick={() => onChange(null)}
            >
                <Factory className="mr-1 h-3 w-3" />
                Habilitar fabricación
            </Button>
        );
    }

    const statuses = product.statuses ?? [];

    const handleValueChange = (value: string) => {
        const targetId = value === PENDING ? null : Number(value);
        const rollback = getStageRollback(
            statuses,
            product.production_status_id,
            targetId,
        );

        if (rollback.isRollback) {
            setPendingRollback({
                targetId,
                stepsBack: rollback.stepsBack,
                targetName: rollback.targetName,
            });

            return;
        }

        onChange(targetId);
    };

    return (
        <>
            <Select
                value={
                    product.production_status_id
                        ? String(product.production_status_id)
                        : PENDING
                }
                onValueChange={handleValueChange}
            >
                <SelectTrigger
                    className="mt-2 h-8 w-fit gap-2 text-xs"
                    aria-label={`Estado de fabricación de ${product.name}`}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={PENDING}>Sin empezar</SelectItem>
                    {statuses.map((status) => (
                        <SelectItem key={status.id} value={String(status.id)}>
                            {status.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <StageRollbackConfirmation
                show={pendingRollback !== null}
                productName={product.name}
                stepsBack={pendingRollback?.stepsBack ?? 0}
                targetName={pendingRollback?.targetName ?? ''}
                onConfirm={() => {
                    if (pendingRollback) onChange(pendingRollback.targetId);
                    setPendingRollback(null);
                }}
                onCancel={() => setPendingRollback(null)}
            />
        </>
    );
}
