import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ArrowRight, Flame } from 'lucide-react';
import { TrackingDetail } from './product-group';

export function DetailRow({
    detail,
    next,
    checked,
    onToggle,
    onApplyStatus,
}: {
    detail: TrackingDetail;
    next: ProductionStatus | undefined;
    checked: boolean;
    onToggle: () => void;
    onApplyStatus: (
        statusId: number,
        detailIds: number[],
        statusName?: string,
    ) => void;
}) {
    return (
        <TableRow
            className={
                detail.priority ? 'bg-amber-50 dark:bg-amber-950/30' : undefined
            }
        >
            <TableCell>
                <input
                    type="checkbox"
                    aria-label={`Seleccionar producto ${detail.product_name}`}
                    checked={checked}
                    onChange={onToggle}
                    className="h-4 w-4 cursor-pointer"
                />
            </TableCell>
            <TableCell>
                <a
                    href={route('orders.show', { order: detail.order_id })}
                    className="underline-offset-2 hover:underline"
                >
                    #{detail.order_id}
                </a>
                {detail.photo_number !== null && (
                    <span className="ml-1 text-xs text-gray-500">
                        (foto {detail.photo_number})
                    </span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>{detail.child_name ?? '—'}</span>
                    <span className="text-xs text-gray-500">
                        {detail.client_name}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                {detail.school} ({detail.classroom.toUpperCase()})
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>{detail.product_name}</span>
                    {detail.variant && (
                        <span className="text-xs text-gray-500">
                            {Object.values(detail.variant)
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="max-w-50 truncate">{detail.note}</TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    {detail.priority && (
                        <Badge variant="destructive" className="gap-1">
                            <Flame className="h-3 w-3" />
                            Prioridad
                        </Badge>
                    )}
                    <Badge
                        variant={
                            detail.production_status_id ? 'default' : 'outline'
                        }
                    >
                        {detail.production_status ?? 'Sin empezar'}
                    </Badge>
                </div>
                {detail.status_updated_at && (
                    <span className="block text-xs text-gray-500">
                        {detail.status_updated_at}
                    </span>
                )}
            </TableCell>
            <TableCell>
                {next ? (
                    <Button
                        size="sm"
                        variant="outline"
                        title={`Pasar a "${next.name}"`}
                        onClick={() =>
                            onApplyStatus(next.id, [detail.id], next.name)
                        }
                    >
                        {next.name}
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                ) : (
                    <Badge variant="secondary">Listo para entregar</Badge>
                )}
            </TableCell>
        </TableRow>
    );
}
