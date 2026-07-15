import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { capitalize } from '@/lib/utils';
import { useState } from 'react';
import { nextStatusFor } from '../hooks/use-selection';
import { DetailCard } from './detail-card';
import { DetailRow } from './detail-row';

export type TrackingDetail = {
    id: number;
    order_id: number;
    child_name: string | null;
    client_name: string;
    school: string;
    classroom: string;
    photo_number: number | null;
    attended_photo_session: boolean | null;
    product_id: number;
    product_name: string;
    product_type_id: number;
    product_type: string | null;
    variant: VariantSnapshotEntry[] | null;
    note: string | null;
    production_status_id: number | null;
    production_status: string | null;
    position: number;
    priority: boolean;
    status_updated_at: string | null;
};

export type TrackingProduct = {
    id: number;
    name: string;
    type: string | null;
    statuses: ProductionStatus[];
};

export function ProductGroup({
    product,
    items,
    selected,
    onToggle,
    onToggleGroup,
    onApplyStatus,
}: {
    product: TrackingProduct;
    items: TrackingDetail[];
    selected: number[];
    onToggle: (id: number) => void;
    onToggleGroup: () => void;
    onApplyStatus: (
        statusId: number,
        detailIds: number[],
        statusName?: string,
    ) => void;
}) {
    const [batchStatus, setBatchStatus] = useState<string>('');

    const selectedInGroup = items
        .map((item) => item.id)
        .filter((id) => selected.includes(id));

    const allSelected =
        items.length > 0 && selectedInGroup.length === items.length;

    return (
        <div className="rounded-xl border border-input">
            <header className="flex flex-col gap-3 border-b border-input p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    {product.type && (
                        <Badge variant="outline">
                            {capitalize(product.type)}
                        </Badge>
                    )}
                    <Badge variant="secondary">{items.length}</Badge>
                    {selectedInGroup.length > 0 && (
                        <Badge>{selectedInGroup.length} seleccionados</Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={batchStatus} onValueChange={setBatchStatus}>
                        <SelectTrigger className="min-w-0 flex-1 md:w-48 md:flex-none">
                            <SelectValue placeholder="Cambiar estado a..." />
                        </SelectTrigger>
                        <SelectContent>
                            {product.statuses.map((status) => (
                                <SelectItem
                                    value={String(status.id)}
                                    key={status.id}
                                >
                                    {status.position}. {status.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        disabled={
                            batchStatus === '' || selectedInGroup.length === 0
                        }
                        onClick={() => {
                            const status = product.statuses.find(
                                (s) => String(s.id) === batchStatus,
                            );
                            onApplyStatus(
                                Number(batchStatus),
                                selectedInGroup,
                                status?.name,
                            );
                        }}
                    >
                        Aplicar a {selectedInGroup.length}
                    </Button>
                </div>
            </header>

            <div className="md:hidden">
                <label className="flex items-center gap-3 border-b border-input p-4">
                    <input
                        type="checkbox"
                        aria-label="Seleccionar todos"
                        checked={allSelected}
                        onChange={onToggleGroup}
                        className="h-5 w-5 cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                        Seleccionar todos
                    </span>
                </label>
                {items.map((detail) => (
                    <DetailCard
                        key={detail.id}
                        detail={detail}
                        next={nextStatusFor(product.statuses, detail.position)}
                        checked={selected.includes(detail.id)}
                        onToggle={() => onToggle(detail.id)}
                        onApplyStatus={onApplyStatus}
                    />
                ))}
            </div>

            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <input
                                    type="checkbox"
                                    aria-label="Seleccionar todos"
                                    checked={allSelected}
                                    onChange={onToggleGroup}
                                    className="h-4 w-4 cursor-pointer"
                                />
                            </TableHead>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Niño / Cliente</TableHead>
                            <TableHead>Escuela (Aula)</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((detail) => (
                            <DetailRow
                                key={detail.id}
                                detail={detail}
                                next={nextStatusFor(
                                    product.statuses,
                                    detail.position,
                                )}
                                checked={selected.includes(detail.id)}
                                onToggle={() => onToggle(detail.id)}
                                onApplyStatus={onApplyStatus}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
