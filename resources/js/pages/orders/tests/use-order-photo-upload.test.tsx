import { router } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOrderPhotoUpload } from '../hooks/use-order-photo-upload';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn() },
}));

const compressImage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/compress-image', () => ({ compressImage }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.classroom ?? ''}`,
);

const post = vi.mocked(router.post);

function makeOrder(photoNumber: number | null): Order {
    return {
        photo_number: photoNumber,
        classroom: { id: 5, name: 'Sala Azul' },
    } as Order;
}

function selectFile(
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void,
    file: File,
) {
    act(() => {
        handleFileChange({
            target: { files: [file] },
        } as unknown as ChangeEvent<HTMLInputElement>);
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useOrderPhotoUpload', () => {
    it('sends the order photo_number explicitly', async () => {
        const order = makeOrder(42);
        const compressed = new File(['compressed'], 'compressed.jpg');
        compressImage.mockResolvedValue(compressed);
        post.mockImplementation((_url, _data, options) => {
            options?.onSuccess?.({} as never);
        });

        const file = new File(['data'], 'foto.jpg', { type: 'image/jpeg' });
        const { result } = renderHook(() => useOrderPhotoUpload(order));

        selectFile(result.current.handleFileChange, file);

        await act(() => result.current.submit());

        expect(post).toHaveBeenCalledWith(
            'http://localhost/photos.store/5',
            { photo: compressed, number: 42 },
            expect.objectContaining({ forceFormData: true }),
        );
    });

    it('is disabled and does not upload when photo_number is null', async () => {
        const order = makeOrder(null);
        const file = new File(['data'], 'foto.jpg', { type: 'image/jpeg' });

        const { result } = renderHook(() => useOrderPhotoUpload(order));

        expect(result.current.enabled).toBe(false);

        selectFile(result.current.handleFileChange, file);

        await act(() => result.current.submit());

        expect(post).not.toHaveBeenCalled();
    });

    it('shows a success toast and clears the file on success', async () => {
        const order = makeOrder(42);
        const compressed = new File(['compressed'], 'compressed.jpg');
        compressImage.mockResolvedValue(compressed);
        post.mockImplementation((_url, _data, options) => {
            options?.onSuccess?.({} as never);
        });

        const file = new File(['data'], 'foto.jpg', { type: 'image/jpeg' });
        const { result } = renderHook(() => useOrderPhotoUpload(order));

        selectFile(result.current.handleFileChange, file);

        await act(() => result.current.submit());

        expect(toast.success).toHaveBeenCalled();
        expect(result.current.file).toBeNull();
    });
});
