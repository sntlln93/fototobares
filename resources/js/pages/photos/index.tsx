import { Button } from '@/components/ui/button';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function PhotoIndex({
    classroom,
    photos,
}: {
    classroom: Classroom & { school: School };
    photos: Photo[];
}) {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    return (
        <div className="min-h-screen bg-white p-8 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('schools.show', {
                                school: classroom.school.id,
                            })}
                        >
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Fotos - {classroom.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {classroom.school.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Subir nueva foto
                            </h2>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Seleccionar archivo
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                                    />
                                </div>

                                {previewUrl && (
                                    <div className="mb-4">
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa"
                                            className="h-auto max-h-64 w-full rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                {data.photo && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Archivo: {data.photo.name}
                                    </p>
                                )}

                                <Button
                                    disabled={!data.photo || processing}
                                    className="w-full gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    {processing ? 'Subiendo...' : 'Subir foto'}
                                </Button>
                            </form>

                            <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total de fotos:{' '}
                                    <strong>{photos.length}</strong>
                                </p>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                    Las fotos se numeran automáticamente en
                                    orden de subida.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Photos Grid */}
                    <div className="lg:col-span-2">
                        {photos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="overflow-hidden rounded-lg bg-gray-50 transition-shadow hover:shadow-lg dark:bg-gray-800"
                                    >
                                        <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
                                            <img
                                                src={`/storage/${photo.file_path}`}
                                                alt={`Foto #${photo.number}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute top-2 left-2 rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                                                #{photo.number}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(
                                                    photo.created_at,
                                                ).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleDelete(photo)
                                                }
                                                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg bg-gray-50 py-12 text-center dark:bg-gray-800">
                                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No hay fotos subidas aún
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                                    Sube la primera foto desde el formulario a
                                    la izquierda
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
