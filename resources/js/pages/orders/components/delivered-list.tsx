import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface DeliveredListProps {
    delivered: Order['products'];
    onUndo: (detailId: number) => void;
}

export function DeliveredList({ delivered, onUndo }: DeliveredListProps) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium">Entregados</p>
            <ul className="space-y-2">
                {delivered.map((product) => (
                    <li
                        key={product.order_detail_id}
                        className="flex items-center justify-between rounded-md border border-input bg-green-50 px-3 py-2 text-sm dark:bg-green-950/30"
                    >
                        <span>{product.name}</span>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 hover:bg-green-600">
                                Entregado
                            </Badge>
                            <Button
                                size="icon"
                                variant="ghost"
                                title="Deshacer entrega"
                                onClick={() => onUndo(product.order_detail_id)}
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
