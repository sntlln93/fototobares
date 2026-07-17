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

export interface EditionRowData {
    id: number;
    order_id: number;
    photo_size: string | null;
    diseno: string | null;
    child_name: string | null;
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

export interface EditionClassroom {
    id: number;
    name: string;
    rows: EditionRowData[];
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
    return (
        <div className="rounded-xl border border-input">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-input p-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium">{classroom.name}</h3>
                    <Badge variant="secondary">{classroom.rows.length}</Badge>
                </div>
                {canManage && (
                    <BulkAssignEditorDialog
                        assignableEditors={editors}
                        photoProducts={photoProducts}
                        classroomId={classroom.id}
                    />
                )}
            </header>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Niño</TableHead>
                        <TableHead>Tamaño de foto</TableHead>
                        <TableHead>Diseño</TableHead>
                        <TableHead>Modelo cuadro</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Talle banda</TableHead>
                        {canManage && (
                            <>
                                <TableHead>Carpeta</TableHead>
                                <TableHead>Banda</TableHead>
                                <TableHead>Medalla</TableHead>
                                <TableHead>Taza</TableHead>
                                <TableHead>Guantes</TableHead>
                                <TableHead>Escarapela</TableHead>
                            </>
                        )}
                        <TableHead>Notas</TableHead>
                        <TableHead>Observaciones generales</TableHead>
                        <TableHead>Estado</TableHead>
                        {canManage && <TableHead>Editor asignado</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classroom.rows.map((row) => (
                        <EditionRow
                            key={row.id}
                            row={row}
                            canManage={canManage}
                            editors={editors}
                        />
                    ))}
                </TableBody>
                {canManage && classroom.totals && (
                    <TotalsFooter totals={classroom.totals} />
                )}
            </Table>
        </div>
    );
}
