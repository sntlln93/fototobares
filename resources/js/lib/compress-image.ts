const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.78;

/**
 * Resizes and compresses an image File client-side via canvas: the longest
 * side is capped at MAX_DIMENSION (never upscaled) and re-encoded as JPEG at
 * JPEG_QUALITY. Never rejects — any failure (load error, missing canvas
 * context, null blob) resolves to the original file so uploads still proceed.
 */
export async function compressImage(file: File): Promise<File> {
    try {
        const image = await loadImage(file);
        const scale = Math.min(
            1,
            MAX_DIMENSION / Math.max(image.width, image.height),
        );
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
            return file;
        }

        context.drawImage(image, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
        });

        if (!blob) {
            return file;
        }

        const baseName = file.name.replace(/\.[^./\\]+$/, '');

        return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    } catch {
        return file;
    }
}

async function loadImage(file: File): Promise<HTMLImageElement> {
    const objectUrl = URL.createObjectURL(file);

    try {
        return await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = objectUrl;
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
