import { Trash2, Upload } from 'lucide-react';

interface PhotoGridProps {
    photos: Photo[];
    handleDelete: (photo: Photo) => void;
}

export function PhotoGrid({ photos, handleDelete }: PhotoGridProps) {
    return (
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
                                    onClick={() => handleDelete(photo)}
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
                        Sube la primera foto desde el formulario a la izquierda
                    </p>
                </div>
            )}
        </div>
    );
}
