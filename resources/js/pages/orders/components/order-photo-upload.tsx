import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useOrderPhotoUpload } from '../hooks/use-order-photo-upload';

interface OrderPhotoUploadProps {
    order: Order;
}

export function OrderPhotoUpload({ order }: OrderPhotoUploadProps) {
    const {
        enabled,
        fileInputRef,
        file,
        processing,
        handleFileChange,
        submit,
    } = useOrderPhotoUpload(order);

    if (!enabled) {
        return null;
    }

    return (
        <div className="mt-2 flex items-center gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block text-xs text-gray-500 file:mr-2 file:rounded-full file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
            />
            <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!file || processing}
                onClick={submit}
            >
                <Upload className="mr-1 h-4 w-4" />
                {processing ? 'Subiendo...' : 'Subir foto'}
            </Button>
        </div>
    );
}
