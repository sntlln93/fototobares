import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import {
    StatusRow,
    StockableOption,
    StockDirection,
} from '../hooks/use-status-actions';
import { AttachStockableForm } from './attach-stockable-form';
import { StockableDelta } from './stockable-delta';

export function ConsumptionDialog({
    status,
    stockables,
    onAttach,
    onDetach,
    onClose,
}: {
    status: StatusRow;
    stockables: StockableOption[];
    onAttach: (
        stockableId: number,
        quantity: number,
        direction: StockDirection,
    ) => void;
    onDetach: (stockableId: number) => void;
    onClose: () => void;
}) {
    const available = stockables.filter(
        (stockable) =>
            !status.stockables.some((used) => used.id === stockable.id),
    );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insumos de "{status.name}"</DialogTitle>
                    <DialogDescription>
                        Estos insumos se restan o se suman al stock cuando un
                        producto llega a esta etapa.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {status.stockables.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Esta etapa no mueve insumos.
                        </p>
                    )}

                    {status.stockables.map((stockable) => (
                        <div
                            key={stockable.id}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                        >
                            <span className="flex-1 text-sm">
                                <StockableDelta
                                    quantity={stockable.quantity}
                                    name={stockable.name}
                                />
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Quitar movimiento"
                                onClick={() => onDetach(stockable.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <AttachStockableForm
                    stockables={available}
                    onAttach={onAttach}
                />
            </DialogContent>
        </Dialog>
    );
}
