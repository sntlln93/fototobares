import { compressImage } from '@/lib/compress-image';
import { router } from '@inertiajs/react';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Uploads a single photo for this order's assigned `photo_number`, reusing
 * the classroom `photos.store` endpoint with the number sent explicitly
 * (filename parsing is irrelevant for this flow). No-op when the order has
 * no `photo_number` assigned yet.
 */
export function useOrderPhotoUpload(order: Order) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);

    const enabled =
        order.photo_number !== null && order.photo_number !== undefined;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const submit = async () => {
        if (!enabled || !file || processing) {
            return;
        }

        setProcessing(true);

        try {
            const compressed = await compressImage(file);

            await new Promise<void>((resolve, reject) => {
                router.post(
                    route('photos.store', {
                        classroom: order.classroom.id,
                    }),
                    { photo: compressed, number: order.photo_number },
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

            toast.success('Foto subida');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'No se pudo subir la foto',
            );
        } finally {
            setProcessing(false);
        }
    };

    return {
        enabled,
        fileInputRef,
        file,
        processing,
        handleFileChange,
        submit,
    };
}
