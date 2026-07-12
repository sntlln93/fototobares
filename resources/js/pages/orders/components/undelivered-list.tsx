import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UndeliveredListProps {
    undelivered: Order['products'];
    selected: number[];
    onToggle: (detailId: number) => void;
    onDeliverSelected: () => void;
}

export function UndeliveredList({
    undelivered,
    selected,
    onToggle,
    onDeliverSelected,
}: UndeliveredListProps) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium">Pendientes de entrega</p>
            <ul className="space-y-2">
                {undelivered.map((product) => (
                    <li
                        key={product.order_detail_id}
                        className="flex items-center justify-between rounded-md border border-input px-3 py-2"
                    >
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selected.includes(
                                    product.order_detail_id,
                                )}
                                onChange={() =>
                                    onToggle(product.order_detail_id)
                                }
                            />
                            {product.name}
                        </label>
                        <Badge variant="outline">
                            {product.production_status ?? 'Sin empezar'}
                        </Badge>
                    </li>
                ))}
            </ul>

            <Button
                className="mt-3 w-full"
                variant="secondary"
                disabled={selected.length === 0}
                onClick={onDeliverSelected}
            >
                Entregar seleccionados ({selected.length})
            </Button>
        </div>
    );
}
