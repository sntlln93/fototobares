import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AssignableEditor } from '@/features/editor-assignment/BulkAssignEditorDialog';
import { cn } from '@/lib/utils';
import { AssignmentControl } from './assignment-control';
import {
    EditingStatusValue,
    EditionRowData,
    EditionVariantValue,
} from './classroom-table';
import { TransitionControl } from './transition-control';

const STATUS_LABELS: Record<EditingStatusValue, string> = {
    pendiente: 'Pendiente',
    editada: 'Editada',
    ok: 'Ok',
    a_corregir: 'A corregir',
};

const STATUS_VARIANTS: Record<
    EditingStatusValue,
    'outline' | 'default' | 'warning'
> = {
    pendiente: 'outline',
    editada: 'default',
    ok: 'default',
    a_corregir: 'warning',
};

const yesNo = (value: boolean | undefined) => (value ? 'Sí' : 'No');

function rowClassName(isHighlighted: boolean): string {
    return cn(
        'border-l-4 border-l-transparent',
        isHighlighted && 'border-l-blue-400 bg-blue-50/70 dark:bg-blue-950/20',
    );
}

function VariantCell({ value }: { value: EditionVariantValue | null }) {
    if (!value) return <>—</>;

    return (
        <span className="inline-flex items-center gap-1">
            {value.color && (
                <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: value.color }}
                />
            )}
            {value.label}
        </span>
    );
}

/**
 * One row per photo-editable order detail. Order-level columns (modelo
 * cuadro, color, talle banda, accesorios, observaciones generales) only
 * render on the first row of each order within its photo-product group —
 * blank on the rest — to avoid repeating order data across its rows.
 */
export function EditionRow({
    row,
    variantColumns,
    canManage,
    editors,
    isHighlighted,
    onHoverChange,
}: {
    row: EditionRowData;
    variantColumns: string[];
    canManage: boolean;
    editors: AssignableEditor[];
    isHighlighted: boolean;
    onHoverChange: (orderSeq: number | null) => void;
}) {
    const first = row.is_first_of_order;

    return (
        <TableRow
            className={rowClassName(isHighlighted)}
            onMouseEnter={() => onHoverChange(row.order_seq)}
            onMouseLeave={() => onHoverChange(null)}
        >
            <TableCell>
                {row.photo_number !== null ? (
                    <a
                        href={route('orders.show', { order: row.order_id })}
                        className="underline-offset-2 hover:underline"
                    >
                        {row.photo_number}
                    </a>
                ) : (
                    '—'
                )}
            </TableCell>
            <TableCell>{row.child_name ?? '—'}</TableCell>
            {variantColumns.map((label) => (
                <TableCell key={label}>
                    <VariantCell value={row.variants[label] ?? null} />
                </TableCell>
            ))}
            {canManage && (
                <>
                    <TableCell>
                        {first ? (row.modelo_cuadro ?? '—') : ''}
                    </TableCell>
                    <TableCell>{first ? (row.color ?? '—') : ''}</TableCell>
                    <TableCell>
                        {first ? (row.banda_talle ?? '—') : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.carpeta)
                            : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.banda)
                            : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.medalla)
                            : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.taza)
                            : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.guantes)
                            : ''}
                    </TableCell>
                    <TableCell>
                        {first && row.accessories
                            ? yesNo(row.accessories.escarapela)
                            : ''}
                    </TableCell>
                </>
            )}
            <TableCell className="max-w-50 truncate">
                {row.note ? (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{row.note}</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-70 wrap-break-word whitespace-pre-wrap">
                                <p>{row.note}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    row.note
                )}
            </TableCell>
            <TableCell className="max-w-50">
                {!first ? (
                    ''
                ) : row.observaciones_generales &&
                  row.observaciones_generales.length > 0 ? (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ul className="flex flex-col gap-0.5 text-xs text-gray-500">
                                    {row.observaciones_generales.map((note) => (
                                        <li key={note.id} className="truncate">
                                            {note.body}
                                        </li>
                                    ))}
                                </ul>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-70 wrap-break-word whitespace-pre-wrap">
                                {row.observaciones_generales.map((note) => (
                                    <p key={note.id}>{note.body}</p>
                                ))}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    '—'
                )}
            </TableCell>
            <TableCell>
                <div className="flex flex-col items-start gap-1">
                    <Badge variant={STATUS_VARIANTS[row.editing_status]}>
                        {STATUS_LABELS[row.editing_status]}
                    </Badge>
                    <TransitionControl
                        orderDetailId={row.id}
                        allowedTargets={row.allowed_targets}
                    />
                </div>
            </TableCell>
            {canManage && (
                <TableCell>
                    <AssignmentControl
                        orderDetailId={row.id}
                        editors={editors}
                        current={row.editor ?? null}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}
