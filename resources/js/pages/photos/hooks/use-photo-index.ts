import { useForm } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler, useRef, useState } from 'react';

interface UsePhotoIndexParams {
    classroom: Classroom & { school: School };
}

export function usePhotoIndex({ classroom }: UsePhotoIndexParams) {
    const {
        post,
        delete: destroy,
        processing,
        data,
        setData,
    } = useForm({
        photo: null as File | null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('photos.store', { classroom: classroom.id }), {
            forceFormData: true,
            onSuccess: () => {
                setData('photo', null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDelete = (photo: Photo) => {
        if (confirm(`¿Deseas eliminar la foto #${photo.number}?`)) {
            destroy(route('photos.destroy', { photo: photo.id }));
        }
    };

    return {
        data,
        processing,
        fileInputRef,
        previewUrl,
        handleFileChange,
        submit,
        handleDelete,
    };
}
