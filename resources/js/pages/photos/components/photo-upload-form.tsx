import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ChangeEvent, FormEventHandler, RefObject } from 'react';

interface PhotoUploadFormProps {
    submit: FormEventHandler;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    previewUrl: string | null;
    photoFile: File | null;
    processing: boolean;
    totalPhotos: number;
}

export function PhotoUploadForm({
    submit,
    handleFileChange,
    fileInputRef,
    previewUrl,
    photoFile,
    processing,
    totalPhotos,
}: PhotoUploadFormProps) {
    return (
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

                    {photoFile && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Archivo: {photoFile.name}
                        </p>
                    )}

                    <Button
                        disabled={!photoFile || processing}
                        className="w-full gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        {processing ? 'Subiendo...' : 'Subir foto'}
                    </Button>
                </form>

                <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total de fotos: <strong>{totalPhotos}</strong>
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Las fotos se numeran automáticamente en orden de subida.
                    </p>
                </div>
            </div>
        </div>
    );
}
