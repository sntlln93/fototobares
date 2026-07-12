export function ProductionRow({
    label,
    count,
    total,
    barClass,
}: {
    label: string;
    count: number;
    total: number;
    barClass: string;
}) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className="text-gray-500">{count}</span>
            </div>
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                role="progressbar"
                aria-label={label}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
