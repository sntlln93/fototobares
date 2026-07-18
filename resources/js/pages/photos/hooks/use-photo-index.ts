import { compressImage } from '@/lib/compress-image';
import { router } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler, useRef, useState } from 'react';

interface UsePhotoIndexParams {
    classroom: Classroom & { school: School };
}

export type FileUploadState = 'pending' | 'uploading' | 'done' | 'error';

export interface FileUploadStatus {
    name: string;
    status: FileUploadState;
    error?: string;
}

function uploadPhoto(classroomId: number, photo: File): Promise<void> {
    return new Promise((resolve, reject) => {
        router.post(
            route('photos.store', { classroom: classroomId }),
            { photo },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) =>
                    reject(
                        new Error(
                            Object.values(errors)[0] ??
                                'No se pudo subir la foto',
                        ),
                    ),
            },
        );
    });
}

export function usePhotoIndex({ classroom }: UsePhotoIndexParams) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
    const [processing, setProcessing] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles(selected);
        setUploads(
            selected.map((file) => ({ name: file.name, status: 'pending' })),
        );
    };

    const updateStatus = (index: number, patch: Partial<FileUploadStatus>) => {
        setUploads((prev) =>
            prev.map((upload, i) =>
                i === index ? { ...upload, ...patch } : upload,
            ),
        );
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (files.length === 0 || processing) {
            return;
        }

        setProcessing(true);

        for (let i = 0; i < files.length; i++) {
            updateStatus(i, { status: 'uploading' });

            try {
                const compressed = await compressImage(files[i]);
                await uploadPhoto(classroom.id, compressed);
                updateStatus(i, { status: 'done' });
            } catch (error) {
                updateStatus(i, {
                    status: 'error',
                    error:
                        error instanceof Error
                            ? error.message
                            : 'No se pudo subir la foto',
                });
            }
        }

        setProcessing(false);
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = (photo: Photo) => {
        if (confirm(`¿Deseas eliminar la foto #${photo.number}?`)) {
            router.delete(route('photos.destroy', { photo: photo.id }));
        }
    };

    return {
        fileInputRef,
        uploads,
        processing,
        handleFileChange,
        submit,
        handleDelete,
    };
}
