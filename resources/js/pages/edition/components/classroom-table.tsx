import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AssignableEditor,
    BulkAssignEditorDialog,
    PhotoProduct,
} from '@/features/editor-assignment/BulkAssignEditorDialog';
import { useState } from 'react';
import { EditionRow } from './edition-row';
import { TotalsFooter } from './totals-footer';

export type EditingStatusValue = 'pendiente' | 'editada' | 'ok' | 'a_corregir';

export interface EditionAccessoryTotals {
    carpeta: number;
    banda: number;
    medalla: number;
    taza: number;
    guantes: number;
    escarapela: number;
}

export interface EditionAccessoryFlags {
    carpeta: boolean;
    banda: boolean;
    medalla: boolean;
    taza: boolean;
    guantes: boolean;
    escarapela: boolean;
}

export interface EditionVariantValue {
    label: string;
    color?: string;
}

export interface EditionRowData {
    id: number;
    order_id: number;
    order_seq: number;
    photo_size: string | null;
    variants: Record<string, EditionVariantValue | null>;
    child_name: string | null;
    photo_number: number | null;
    variant_search: string;
    editing_status: EditingStatusValue;
    note: string | null;
    allowed_targets: EditingStatusValue[];
    is_first_of_order: boolean;
    editor?: { id: number; name: string } | null;
    modelo_cuadro?: string | null;
    color?: string | null;
    banda_talle?: string | null;
    observaciones_generales?: Note[];
    accessories?: EditionAccessoryFlags;
}

export interface EditionPhotoProductGroup {
    product_id: number;
    product_name: string | null;
    variant_columns: string[];
    rows: EditionRowData[];
}

export interface EditionClassroom {
    id: number;
    name: string;
    order_count: number;
    photoProductGroups: EditionPhotoProductGroup[];
    totals?: EditionAccessoryTotals;
}

export interface EditionSchool {
    id: number;
    name: string;
    classrooms: EditionClassroom[];
}

export function ClassroomTable({
    classroom,
    canManage,
    editors,
    photoProducts,
}: {
    classroom: EditionClassroom;
    canManage: boolean;
    editors: AssignableEditor[];
    photoProducts: PhotoProduct[];
}) {
    const [hoveredOrderSeq, setHoveredOrderSeq] = useState<number | null>(null);

    return (
        <div className="rounded-xl border border-input">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-input p-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium">{classroom.name}</h3>
                    <Badge variant="secondary">{classroom.order_count}</Badge>
                </div>
                {canManage && (
                    <BulkAssignEditorDialog
                        assignableEditors={editors}
                        photoProducts={photoProducts}
                        classroomId={classroom.id}
                    />
                )}
            </header>

            <div className="flex flex-col gap-6 p-4">
                {classroom.photoProductGroups.map((group, index) => {
                    const isLastGroup =
                        index === classroom.photoProductGroups.length - 1;
                    const showTotals =
                        isLastGroup && canManage && classroom.totals;

                    return (
                        <div
                            key={group.product_id}
                            className="flex flex-col gap-2"
                        >
                            <h4 className="font-medium text-muted-foreground">
                                {group.product_name}
                            </h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Niño</TableHead>
                                        {group.variant_columns.map((label) => (
                                            <TableHead key={label}>
                                                {label}
                                            </TableHead>
                                        ))}
                                        {canManage && (
                                            <>
                                                <TableHead>
                                                    Modelo cuadro
                                                </TableHead>
                                                <TableHead>Color</TableHead>
                                                <TableHead>
                                                    Talle banda
                                                </TableHead>
                                                <TableHead>Carpeta</TableHead>
                                                <TableHead>Banda</TableHead>
                                                <TableHead>Medalla</TableHead>
                                                <TableHead>Taza</TableHead>
                                                <TableHead>Guantes</TableHead>
                                                <TableHead>
                                                    Escarapela
                                                </TableHead>
                                            </>
                                        )}
                                        <TableHead>Notas</TableHead>
                                        <TableHead>
                                            Observaciones generales
                                        </TableHead>
                                        <TableHead>Estado</TableHead>
                                        {canManage && (
                                            <TableHead>
                                                Editor asignado
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.rows.map((row) => (
                                        <EditionRow
                                            key={row.id}
                                            row={row}
                                            variantColumns={
                                                group.variant_columns
                                            }
                                            canManage={canManage}
                                            editors={editors}
                                            isHighlighted={
                                                hoveredOrderSeq !== null &&
                                                hoveredOrderSeq ===
                                                    row.order_seq
                                            }
                                            onHoverChange={setHoveredOrderSeq}
                                        />
                                    ))}
                                </TableBody>
                                {showTotals && classroom.totals && (
                                    <TotalsFooter
                                        totals={classroom.totals}
                                        leadingColSpan={
                                            2 + group.variant_columns.length + 3
                                        }
                                    />
                                )}
                            </Table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
