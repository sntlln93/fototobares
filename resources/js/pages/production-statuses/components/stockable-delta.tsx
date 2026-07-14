export function StockableDelta({
    quantity,
    name,
}: {
    quantity: number;
    name: string;
}) {
    const isAdd = quantity > 0;

    return (
        <span
            className={
                isAdd
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500'
            }
        >
            {isAdd ? `+${quantity}` : quantity}× {name}
        </span>
    );
}
