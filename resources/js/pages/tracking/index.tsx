import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalize } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, Flame, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type TrackingDetail = {
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
    variant: Record<string, string> | null;
    note: string | null;
    production_status_id: number | null;
    production_status: string | null;
    position: number;
    priority: boolean;
    status_updated_at: string | null;
};

type Filters = {
    search: string | null;
    school_id: string | null;
    product_type_id: string | null;
    production_status_id: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Seguimiento',
        href: route('tracking.index'),
    },
];

export default function Tracking({
    details,
    productTypes,
    schools,
    filters,
}: PageProps<{
    details: TrackingDetail[];
    productTypes: ProductTypeWithStatuses[];
    schools: Array<{ id: number; name: string }>;
    filters: Filters;
}>) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search ?? '');

    const groups = useMemo(() => {
        return productTypes
            .map((type) => ({
                type,
                items: details.filter(
                    (detail) => detail.product_type_id === type.id,
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [details, productTypes]);

    const applyFilters = (overrides: Partial<Filters>) => {
        const params: Record<string, string> = {};
        const next = { ...filters, search, ...overrides };

        if (next.search) params.search = next.search;
        if (next.school_id) params.school_id = String(next.school_id);
        if (next.product_type_id)
            params.product_type_id = String(next.product_type_id);
        if (next.production_status_id)
            params.production_status_id = String(next.production_status_id);

        router.get(route('tracking.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggle = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const toggleGroup = (items: TrackingDetail[]) => {
        const ids = items.map((item) => item.id);
        const allSelected = ids.every((id) => selected.includes(id));

        setSelected((prev) =>
            allSelected
                ? prev.filter((id) => !ids.includes(id))
                : [...new Set([...prev, ...ids])],
        );
    };

    const applyStatus = (
        statusId: number,
        detailIds: number[],
        statusName?: string,
    ) => {
        if (detailIds.length === 0) {
            toast.error('Seleccioná al menos un producto');
            return;
        }

        router.post(
            route('tracking.batch'),
            {
                detail_ids: detailIds,
                production_status_id: statusId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelected([]);
                    toast.success(
                        statusName
                            ? `Estado actualizado a "${statusName}"`
                            : 'Estado actualizado',
                    );
                },
                onError: (errors) => {
                    toast.error(
                        Object.values(errors)[0] ??
                            'No se pudo actualizar el estado',
                    );
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimiento" />

            <section className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters({ search });
                        }}
                    >
                        <Input
                            placeholder="Niño, cliente o n° de pedido"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                        <Button type="submit" variant="secondary" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    <Select
                        value={
                            filters.school_id
                                ? String(filters.school_id)
                                : 'all'
                        }
                        onValueChange={(value) =>
                            applyFilters({
                                school_id: value === 'all' ? null : value,
                            })
                        }
                    >
                        <SelectTrigger className="md:w-56">
                            <SelectValue placeholder="Escuela" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todas las escuelas
                            </SelectItem>
                            {schools.map((school) => (
                                <SelectItem
                                    value={String(school.id)}
                                    key={school.id}
                                >
                                    {school.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={
                            filters.product_type_id
                                ? String(filters.product_type_id)
                                : 'all'
                        }
                        onValueChange={(value) =>
                            applyFilters({
                                product_type_id: value === 'all' ? null : value,
                            })
                        }
                    >
                        <SelectTrigger className="md:w-48">
                            <SelectValue placeholder="Tipo de producto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {productTypes.map((type) => (
                                <SelectItem
                                    value={String(type.id)}
                                    key={type.id}
                                >
                                    {capitalize(type.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {groups.length === 0 ? (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Nada en producción</CardTitle>
                            <CardDescription>
                                No hay productos pendientes de fabricación con
                                los filtros actuales.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    groups.map(({ type, items }) => (
                        <ProductTypeGroup
                            key={type.id}
                            type={type}
                            items={items}
                            selected={selected}
                            onToggle={toggle}
                            onToggleGroup={() => toggleGroup(items)}
                            onApplyStatus={applyStatus}
                        />
                    ))
                )}
            </section>
        </AppLayout>
    );
}

function ProductTypeGroup({
    type,
    items,
    selected,
    onToggle,
    onToggleGroup,
    onApplyStatus,
}: {
    type: ProductTypeWithStatuses;
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

    const nextStatusFor = (detail: TrackingDetail) =>
        type.statuses.find((status) => status.position === detail.position + 1);

    return (
        <div className="rounded-xl border border-input">
            <header className="flex flex-col gap-3 border-b border-input p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                        {capitalize(type.name)}
                    </h2>
                    <Badge variant="secondary">{items.length}</Badge>
                    {selectedInGroup.length > 0 && (
                        <Badge>{selectedInGroup.length} seleccionados</Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Select value={batchStatus} onValueChange={setBatchStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Cambiar estado a..." />
                        </SelectTrigger>
                        <SelectContent>
                            {type.statuses.map((status) => (
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
                            const status = type.statuses.find(
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">
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
                    {items.map((detail) => {
                        const next = nextStatusFor(detail);

                        return (
                            <TableRow
                                key={detail.id}
                                className={
                                    detail.priority
                                        ? 'bg-amber-50 dark:bg-amber-950/30'
                                        : undefined
                                }
                            >
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        aria-label={`Seleccionar producto ${detail.product_name}`}
                                        checked={selected.includes(detail.id)}
                                        onChange={() => onToggle(detail.id)}
                                        className="h-4 w-4 cursor-pointer"
                                    />
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={route('orders.show', {
                                            order: detail.order_id,
                                        })}
                                        className="underline-offset-2 hover:underline"
                                    >
                                        #{detail.order_id}
                                    </a>
                                    {detail.photo_number !== null && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            (foto {detail.photo_number})
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{detail.child_name ?? '—'}</span>
                                        <span className="text-xs text-gray-500">
                                            {detail.client_name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {detail.school} (
                                    {detail.classroom.toUpperCase()})
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{detail.product_name}</span>
                                        {detail.variant && (
                                            <span className="text-xs text-gray-500">
                                                {Object.values(detail.variant)
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {detail.note}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {detail.priority && (
                                            <Badge
                                                variant="destructive"
                                                className="gap-1"
                                            >
                                                <Flame className="h-3 w-3" />
                                                Prioridad
                                            </Badge>
                                        )}
                                        <Badge
                                            variant={
                                                detail.production_status_id
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {detail.production_status ??
                                                'Sin empezar'}
                                        </Badge>
                                    </div>
                                    {detail.status_updated_at && (
                                        <span className="block text-xs text-gray-500">
                                            {detail.status_updated_at}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {next ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            title={`Pasar a "${next.name}"`}
                                            onClick={() =>
                                                onApplyStatus(
                                                    next.id,
                                                    [detail.id],
                                                    next.name,
                                                )
                                            }
                                        >
                                            {next.name}
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Badge variant="secondary">
                                            Listo para entregar
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
