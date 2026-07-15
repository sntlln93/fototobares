import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { variantSummary } from '@/lib/variants';
import { ArrowRight, Flame } from 'lucide-react';
import { TrackingDetail } from './product-group';

export function DetailCard({
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
        <div
            className={cn(
                'flex flex-col gap-3 border-b border-input p-4 last:border-b-0',
                detail.priority && 'bg-amber-50 dark:bg-amber-950/30',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        aria-label={`Seleccionar producto ${detail.product_name}`}
                        checked={checked}
                        onChange={onToggle}
                        className="h-5 w-5 cursor-pointer"
                    />
                    <span>
                        <a
                            href={route('orders.show', {
                                order: detail.order_id,
                            })}
                            className="font-medium underline-offset-2 hover:underline"
                        >
                            #{detail.order_id}
                        </a>
                        {detail.photo_number !== null && (
                            <span className="ml-1 text-xs text-gray-500">
                                (foto {detail.photo_number})
                            </span>
                        )}
                    </span>
                </label>
                <div className="flex flex-wrap items-center justify-end gap-1">
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
            </div>

            <div className="flex flex-col gap-0.5 text-sm">
                <span>
                    {detail.child_name ?? '—'}
                    <span className="text-gray-500">
                        {' '}
                        · {detail.client_name}
                    </span>
                </span>
                <span className="text-gray-500">
                    {detail.school} ({detail.classroom.toUpperCase()})
                </span>
                {detail.variant && detail.variant.length > 0 && (
                    <span className="text-xs text-gray-500">
                        {variantSummary(detail.variant)}
                    </span>
                )}
                {detail.note && (
                    <span className="text-xs text-gray-500 italic">
                        {detail.note}
                    </span>
                )}
                {detail.status_updated_at && (
                    <span className="text-xs text-gray-500">
                        {detail.status_updated_at}
                    </span>
                )}
            </div>

            {next ? (
                <Button
                    variant="outline"
                    className="w-full"
                    title={`Pasar a "${next.name}"`}
                    onClick={() =>
                        onApplyStatus(next.id, [detail.id], next.name)
                    }
                >
                    {next.name}
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            ) : (
                <Badge variant="secondary" className="self-start">
                    Listo para entregar
                </Badge>
            )}
        </div>
    );
}
