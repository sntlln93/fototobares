import { TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { EditionAccessoryTotals } from './classroom-table';

/**
 * Per-classroom accessory totals (carpeta/banda/medalla/taza + the inert
 * guantes/escarapela columns), counted once per order by the backend.
 * Manager-only view: aligned under the accessory columns, which only render
 * for `canManage`.
 */
export function TotalsFooter({
    totals,
    leadingColSpan,
}: {
    totals: EditionAccessoryTotals;
    leadingColSpan: number;
}) {
    return (
        <TableFooter>
            <TableRow>
                <TableCell colSpan={leadingColSpan}>Totales</TableCell>
                <TableCell>{totals.carpeta}</TableCell>
                <TableCell>{totals.banda}</TableCell>
                <TableCell>{totals.medalla}</TableCell>
                <TableCell>{totals.taza}</TableCell>
                <TableCell>{totals.guantes}</TableCell>
                <TableCell>{totals.escarapela}</TableCell>
                <TableCell colSpan={4} />
            </TableRow>
        </TableFooter>
    );
}
