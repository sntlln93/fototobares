import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { StatusRow, StockableOption } from '../hooks/use-status-actions';

export function ConsumptionDialog({
    status,
    stockables,
    onAttach,
    onDetach,
    onClose,
}: {
    status: StatusRow;
    stockables: StockableOption[];
    onAttach: (stockableId: number, quantity: number) => void;
    onDetach: (stockableId: number) => void;
    onClose: () => void;
}) {
    const [stockableId, setStockableId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');

    const available = stockables.filter(
        (stockable) =>
            !status.stockables.some((used) => used.id === stockable.id),
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!stockableId) return;

        onAttach(Number(stockableId), Math.max(1, Number(quantity) || 1));
        setStockableId('');
        setQuantity('1');
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insumos de "{status.name}"</DialogTitle>
                    <DialogDescription>
                        Estos insumos se descuentan del stock cuando un producto
                        llega a esta etapa.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {status.stockables.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Esta etapa no consume insumos.
                        </p>
                    )}

                    {status.stockables.map((stockable) => (
                        <div
                            key={stockable.id}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                        >
                            <span className="flex-1 text-sm">
                                {stockable.quantity} × {stockable.name}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Quitar consumo"
                                onClick={() => onDetach(stockable.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <form onSubmit={submit} className="flex items-end gap-2">
                    <div className="flex-1">
                        <Select
                            value={stockableId}
                            onValueChange={setStockableId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Agregar insumo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {available.map((stockable) => (
                                    <SelectItem
                                        value={String(stockable.id)}
                                        key={stockable.id}
                                    >
                                        {stockable.name} ({stockable.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-20"
                        aria-label="Cantidad"
                    />
                    <Button size="sm" variant="outline" type="submit">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
