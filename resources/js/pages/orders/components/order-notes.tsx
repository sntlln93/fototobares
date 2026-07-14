import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteNoteConfirmation } from './delete-note-confirmation';

export function OrderNotes({ order, notes }: { order: Order; notes: Note[] }) {
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: order.id,
        body: '',
    });

    const addNote = () => {
        post(route('notes.store'), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    return (
        <>
            {noteToDelete && (
                <DeleteNoteConfirmation
                    note={noteToDelete}
                    show={!!noteToDelete}
                    onClose={() => setNoteToDelete(null)}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Notas del pedido</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {notes.length ? (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="flex items-start justify-between gap-2 border-b border-gray-200 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
                            >
                                <div>
                                    <p className="text-sm text-black dark:text-white">
                                        {note.body}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {note.created_at}
                                    </p>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Eliminar nota"
                                    onClick={() => setNoteToDelete(note)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <CardDescription className="text-center text-gray-500">
                            Sin notas registradas
                        </CardDescription>
                    )}

                    <div className="flex flex-col gap-2">
                        <Textarea
                            placeholder="Escribí una nota..."
                            value={data.body}
                            onChange={(event) =>
                                setData('body', event.target.value)
                            }
                        />
                        <InputError message={errors.body} />

                        <Button
                            size="sm"
                            className="self-end"
                            disabled={processing || !data.body.trim()}
                            onClick={addNote}
                        >
                            Agregar nota
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
