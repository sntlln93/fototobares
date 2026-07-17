import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AssignableEditor } from '@/features/editor-assignment/BulkAssignEditorDialog';
import { X } from 'lucide-react';
import { useEditorAssignment } from '../hooks/use-editor-assignment';

/**
 * Individual assign/unassign control for a single row: a select of
 * assignable editors plus an unassign button, shown only once one is set.
 */
export function AssignmentControl({
    orderDetailId,
    editors,
    current,
}: {
    orderDetailId: number;
    editors: AssignableEditor[];
    current: { id: number; name: string } | null;
}) {
    const { assign, unassign } = useEditorAssignment();

    return (
        <div className="flex items-center gap-1">
            <Select
                value={current ? String(current.id) : undefined}
                onValueChange={(value) => assign(orderDetailId, Number(value))}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                    {editors.map((editor) => (
                        <SelectItem key={editor.id} value={String(editor.id)}>
                            {editor.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {current && (
                <Button
                    size="icon"
                    variant="ghost"
                    title="Desasignar editor"
                    onClick={() => unassign(orderDetailId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
