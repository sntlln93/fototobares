import { cn } from '@/lib/utils';

interface InstallmentsIndicatorProps {
    paymentPlan: number;
    paidInstallments: number;
    currentInstallmentFraction?: number | null;
}

/**
 * Draws `paymentPlan` squares, one per installment: fully filled squares
 * for installments already paid, a partially filled one for the
 * installment in progress (proportional to the amount paid so far), and
 * empty (bordered) squares for the rest.
 */
export function InstallmentsIndicator({
    paymentPlan,
    paidInstallments,
    currentInstallmentFraction,
}: InstallmentsIndicatorProps) {
    const fraction = currentInstallmentFraction ?? 0;

    return (
        <div className="flex flex-wrap gap-1">
            {Array.from({ length: paymentPlan }).map((_, index) => {
                const filledFraction =
                    index < paidInstallments
                        ? 1
                        : index === paidInstallments
                          ? fraction
                          : 0;

                return (
                    <span
                        key={index}
                        className={cn(
                            'relative size-3 overflow-hidden rounded-none',
                            filledFraction > 0
                                ? 'bg-transparent'
                                : 'border bg-transparent',
                        )}
                    >
                        {filledFraction > 0 && (
                            <span
                                className="absolute inset-x-0 bottom-0 bg-primary"
                                style={{ height: `${filledFraction * 100}%` }}
                            />
                        )}
                    </span>
                );
            })}
        </div>
    );
}
