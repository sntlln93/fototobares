import { PhotoGrid } from './components/photo-grid';
import { PhotoHeader } from './components/photo-header';
import { PhotoUploadForm } from './components/photo-upload-form';
import { usePhotoIndex } from './hooks/use-photo-index';

export default function PhotoIndex({
    classroom,
    photos,
}: {
    classroom: Classroom & { school: School };
    photos: Photo[];
}) {
    const {
        data,
        processing,
        fileInputRef,
        previewUrl,
        handleFileChange,
        submit,
        handleDelete,
    } = usePhotoIndex({ classroom });

    return (
        <div className="min-h-screen bg-white p-8 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                <PhotoHeader classroom={classroom} />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <PhotoUploadForm
                        submit={submit}
                        handleFileChange={handleFileChange}
                        fileInputRef={fileInputRef}
                        previewUrl={previewUrl}
                        photoFile={data.photo}
                        processing={processing}
                        totalPhotos={photos.length}
                    />

                    <PhotoGrid photos={photos} handleDelete={handleDelete} />
                </div>
            </div>
        </div>
    );
}
