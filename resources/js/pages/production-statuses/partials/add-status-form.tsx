import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function AddStatusForm({
    onAdd,
}: {
    onAdd: (name: string, onSuccess: () => void) => void;
}) {
    const [name, setName] = useState('');

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        onAdd(name.trim(), () => setName(''));
    };

    return (
        <form onSubmit={submit} className="flex items-center gap-2 pt-2">
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nueva etapa..."
                className="h-8"
            />
            <Button size="sm" variant="outline" type="submit">
                <Plus className="h-4 w-4" />
                Agregar
            </Button>
        </form>
    );
}
