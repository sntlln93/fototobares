import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { onSort } from '@/lib/services/filter';
import { router } from '@inertiajs/react';
import { ArrowUpDown, Diff, Edit2, Trash } from 'lucide-react';

export function StockablesTable({
    stockables,
    onDelete,
    onAlterStock,
}: {
    stockables: Array<Stockable & { products: Product[] }>;
    onDelete: (stockable: Stockable) => void;
    onAlterStock: (stockable: Stockable) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onSort('id', 'stockables.index')}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                            #
                        </div>
                    </TableHead>
                    <TableHead>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    onSort('name', 'stockables.index')
                                }
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                            Stockeable
                        </div>
                    </TableHead>
                    <TableHead>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    onSort('quantity', 'stockables.index')
                                }
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </button>
                            Cantidad
                        </div>
                    </TableHead>
                    <TableHead>
                        <div className="flex items-center gap-2">Productos</div>
                    </TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stockables.map((stockable) => (
                    <TableRow key={stockable.id}>
                        <TableCell className="font-medium">
                            {stockable.id}
                        </TableCell>
                        <TableCell>{stockable.name}</TableCell>
                        <TableCell>
                            {stockable.quantity < stockable.alert_at ? (
                                <Badge variant="destructive">
                                    {`${stockable.quantity} (${stockable.unit})`}
                                </Badge>
                            ) : (
                                `${stockable.quantity} (${stockable.unit})`
                            )}
                        </TableCell>
                        <TableCell>
                            {stockable.products
                                .map((product) => product.name)
                                .join(', ')}
                        </TableCell>
                        <TableCell className="flex gap-2">
                            <Button
                                size={'sm'}
                                variant={'warning'}
                                onClick={() =>
                                    router.visit(
                                        route('stockables.edit', {
                                            stockable: stockable.id,
                                        }),
                                    )
                                }
                            >
                                <Edit2 />
                            </Button>
                            <Button
                                size={'sm'}
                                variant={'destructive'}
                                onClick={() => onDelete(stockable)}
                            >
                                <Trash />
                            </Button>
                            <Button
                                size={'sm'}
                                variant="secondary"
                                onClick={() => onAlterStock(stockable)}
                            >
                                <Diff />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
