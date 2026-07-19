import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface StickerOrderSummary {
    id: number;
    order_number: number;
    child_name: string | null;
    school_name: string;
    classroom_name: string;
    is_finished: boolean;
}

export function StickerOrdersTable({
    orders,
    selected,
    onToggle,
}: {
    orders: StickerOrderSummary[];
    selected: number[];
    onToggle: (id: number) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>N° de orden</TableHead>
                    <TableHead>Niño</TableHead>
                    <TableHead>Escuela (Aula)</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow
                        key={order.id}
                        className={order.is_finished ? undefined : 'opacity-50'}
                    >
                        <TableCell>
                            <Checkbox
                                aria-label={`Seleccionar pedido ${order.order_number}`}
                                checked={selected.includes(order.id)}
                                disabled={!order.is_finished}
                                onCheckedChange={() => onToggle(order.id)}
                            />
                        </TableCell>
                        <TableCell className="font-medium">
                            {order.order_number}
                        </TableCell>
                        <TableCell>{order.child_name ?? '—'}</TableCell>
                        <TableCell>
                            {order.school_name} ({order.classroom_name})
                        </TableCell>
                        <TableCell>
                            {order.is_finished ? 'Terminado' : '—'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
