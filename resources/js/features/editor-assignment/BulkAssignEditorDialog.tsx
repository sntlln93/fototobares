import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PhotoProductsChecklist } from './PhotoProductsChecklist';
import { useBulkAssignEditor } from './useBulkAssignEditor';

export interface AssignableEditor {
    id: number;
    name: string;
}

export interface PhotoProduct {
    id: number;
    name: string;
}

export function BulkAssignEditorDialog({
    assignableEditors,
    photoProducts,
    schoolId,
    classroomId,
}: {
    assignableEditors: AssignableEditor[];
    photoProducts: PhotoProduct[];
    schoolId?: number;
    classroomId?: number;
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, submit, processing, errors } = useBulkAssignEditor({
        schoolId,
        classroomId,
    });
    const { auth } = usePage().props;
    const selectableEditors = assignableEditors.filter(
        (editor) => editor.id !== auth.user.id,
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserCog />
                    Asignar editor
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar editor en masa</DialogTitle>
                    <DialogDescription>
                        Asigna un editor a los productos con foto editable que
                        estén en producción.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="editor_id">Editor</Label>
                    <Select
                        value={data.editor_id}
                        onValueChange={(value) => setData('editor_id', value)}
                    >
                        <SelectTrigger id="editor_id">
                            <SelectValue placeholder="Elegir editor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {selectableEditors.map((editor) => (
                                <SelectItem
                                    value={String(editor.id)}
                                    key={editor.id}
                                >
                                    {editor.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.editor_id} />
                </div>

                <PhotoProductsChecklist
                    photoProducts={photoProducts}
                    selectedIds={data.product_ids}
                    onChange={(ids) => setData('product_ids', ids)}
                    error={errors.product_ids}
                />

                <DialogFooter>
                    <Button
                        disabled={processing}
                        onClick={() =>
                            submit((warning) => {
                                setOpen(false);
                                if (warning) toast.warning(warning);
                            })
                        }
                    >
                        Asignar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
