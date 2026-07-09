import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowDown,
    ArrowUp,
    Check,
    Package,
    Pencil,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { StatusRow } from '../hooks/use-status-actions';

export function StatusItem({
    status,
    isFirst,
    isLast,
    isOnly,
    onMoveUp,
    onMoveDown,
    onRename,
    onEditConsumption,
    onDelete,
}: {
    status: StatusRow;
    isFirst: boolean;
    isLast: boolean;
    isOnly: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRename: (name: string, onSuccess: () => void) => void;
    onEditConsumption: () => void;
    onDelete: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(status.name);

    const rename = (e: FormEvent) => {
        e.preventDefault();

        if (name.trim() === status.name) {
            setEditing(false);
            return;
        }

        onRename(name.trim(), () => setEditing(false));
    };

    const inUse = status.details_count > 0;
    const consumes = status.stockables.length > 0;

    if (editing) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                <Badge variant="outline" className="w-8 justify-center">
                    {status.position}
                </Badge>
                <form
                    onSubmit={rename}
                    className="flex flex-1 items-center gap-1"
                >
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8"
                        autoFocus
                    />
                    <Button size="sm" variant="ghost" type="submit">
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                            setName(status.name);
                            setEditing(false);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
            <Badge variant="outline" className="w-8 justify-center">
                {status.position}
            </Badge>
            <div className="flex flex-1 flex-col">
                <span className="text-sm">{status.name}</span>
                {consumes && (
                    <span className="text-xs text-gray-500">
                        {status.stockables
                            .map((s) => `${s.quantity}× ${s.name}`)
                            .join(' · ')}
                    </span>
                )}
            </div>
            {inUse && (
                <span
                    className="text-xs text-gray-500"
                    title="Productos actualmente en esta etapa"
                >
                    {status.details_count} en curso
                </span>
            )}
            <Button
                size="sm"
                variant="ghost"
                disabled={isFirst}
                title="Subir"
                onClick={onMoveUp}
            >
                <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                disabled={isLast}
                title="Bajar"
                onClick={onMoveDown}
            >
                <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                title="Insumos que consume esta etapa"
                onClick={onEditConsumption}
            >
                <Package className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                title="Renombrar"
                onClick={() => setEditing(true)}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                disabled={isOnly || inUse || consumes}
                title={
                    isOnly
                        ? 'No se puede eliminar la única etapa'
                        : inUse
                          ? 'Hay productos en esta etapa'
                          : consumes
                            ? 'Esta etapa consume insumos'
                            : 'Eliminar'
                }
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
