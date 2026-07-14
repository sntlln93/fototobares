import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { StockableOption, StockDirection } from '../hooks/use-status-actions';

export function AttachStockableForm({
    stockables,
    onAttach,
}: {
    stockables: StockableOption[];
    onAttach: (
        stockableId: number,
        quantity: number,
        direction: StockDirection,
    ) => void;
}) {
    const [stockableId, setStockableId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [direction, setDirection] = useState<StockDirection>('subtract');

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!stockableId) return;

        onAttach(
            Number(stockableId),
            Math.max(1, Number(quantity) || 1),
            direction,
        );
        setStockableId('');
        setQuantity('1');
        setDirection('subtract');
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
                <Select value={stockableId} onValueChange={setStockableId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Agregar insumo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {stockables.map((stockable) => (
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
            <Select
                value={direction}
                onValueChange={(value) => setDirection(value as StockDirection)}
            >
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="subtract">Resta del stock</SelectItem>
                    <SelectItem value="add">Suma al stock</SelectItem>
                </SelectContent>
            </Select>
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
    );
}
