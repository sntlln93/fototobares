import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { PriceBreakdown as Breakdown } from '../pricing';

interface PriceBreakdownProps {
    breakdown: Breakdown;
    /** The seller typed a price other than the calculated one */
    adjustedByHand: boolean;
    onRecalculate: () => void;
}

export function PriceBreakdown({
    breakdown,
    adjustedByHand,
    onRecalculate,
}: PriceBreakdownProps) {
    if (breakdown.lines.length === 0) {
        return (
            <p className="mt-2 text-xs text-muted-foreground">
                Agregá un combo o un producto para calcular el precio.
            </p>
        );
    }

    return (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <ul>
                {breakdown.lines.map((line, index) => (
                    <li
                        key={`${line.label}-${index}`}
                        className="flex flex-wrap justify-between gap-2"
                    >
                        <span className="min-w-0">{line.label}</span>
                        <span>
                            {line.amount < 0 ? '−' : '+'}{' '}
                            {formatPrice(Math.abs(line.amount))}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-1">
                <span>Precio calculado</span>
                <span className="font-medium">
                    {formatPrice(breakdown.total)}
                </span>
            </div>

            {adjustedByHand && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-destructive">
                        Precio ajustado a mano
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onRecalculate();
                        }}
                    >
                        Recalcular
                    </Button>
                </div>
            )}
        </div>
    );
}
