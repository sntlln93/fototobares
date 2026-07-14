import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Factory } from 'lucide-react';

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

    return (
        <Select
            value={
                product.production_status_id
                    ? String(product.production_status_id)
                    : PENDING
            }
            onValueChange={(value) =>
                onChange(value === PENDING ? null : Number(value))
            }
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
    );
}
