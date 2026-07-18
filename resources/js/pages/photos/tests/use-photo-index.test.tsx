import { router } from '@inertiajs/react';
import { act, renderHook } from '@testing-library/react';
import { ChangeEvent, FormEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePhotoIndex } from '../hooks/use-photo-index';

vi.mock('@inertiajs/react', () => ({
    router: { post: vi.fn(), delete: vi.fn() },
}));

const compressImage = vi.hoisted(() => vi.fn());

vi.mock('@/lib/compress-image', () => ({ compressImage }));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.classroom ?? ''}`,
);

const post = vi.mocked(router.post);

const classroom = { id: 5, school: { id: 1, name: 'Escuela' } } as Classroom & {
    school: School;
};

function makeFile(name: string): File {
    return new File(['data'], name, { type: 'image/jpeg' });
}

function selectFiles(
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void,
    files: File[],
) {
    act(() => {
        handleFileChange({
            target: { files },
        } as unknown as ChangeEvent<HTMLInputElement>);
    });
}

function submitEvent(): FormEvent {
    return { preventDefault: vi.fn() } as unknown as FormEvent;
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('usePhotoIndex', () => {
    it('uploads each selected file sequentially through compressImage', async () => {
        const files = [
            makeFile('001.jpg'),
            makeFile('002.jpg'),
            makeFile('003.jpg'),
        ];
        const compressed = files.map(
            (file, i) => new File(['compressed'], `compressed-${i}.jpg`),
        );
        compressImage.mockImplementation(
            async (file: File) => compressed[files.indexOf(file)],
        );
        post.mockImplementation((_url, _data, options) => {
            options?.onSuccess?.({} as never);
        });

        const { result } = renderHook(() => usePhotoIndex({ classroom }));

        selectFiles(result.current.handleFileChange, files);

        await act(() => result.current.submit(submitEvent()));

        expect(compressImage).toHaveBeenCalledTimes(3);
        expect(post).toHaveBeenCalledTimes(3);
        files.forEach((_, i) => {
            expect(post).toHaveBeenNthCalledWith(
                i + 1,
                'http://localhost/photos.store/5',
                { photo: compressed[i] },
                expect.objectContaining({ forceFormData: true }),
            );
        });
        expect(
            result.current.uploads.every((upload) => upload.status === 'done'),
        ).toBe(true);
    });

    it('one failing file does not abort the batch', async () => {
        const files = [
            makeFile('001.jpg'),
            makeFile('002.jpg'),
            makeFile('003.jpg'),
        ];
        compressImage.mockImplementation(async (file: File) => file);

        let call = 0;
        post.mockImplementation((_url, _data, options) => {
            call += 1;
            if (call === 2) {
                options?.onError?.({ photo: 'dup' });
            } else {
                options?.onSuccess?.({} as never);
            }
        });

        const { result } = renderHook(() => usePhotoIndex({ classroom }));

        selectFiles(result.current.handleFileChange, files);

        await act(() => result.current.submit(submitEvent()));

        expect(post).toHaveBeenCalledTimes(3);
        expect(result.current.uploads.map((upload) => upload.status)).toEqual([
            'done',
            'error',
            'done',
        ]);
        expect(result.current.uploads[1].error).toBe('dup');
    });

    it('submit with no files selected is a no-op', async () => {
        const { result } = renderHook(() => usePhotoIndex({ classroom }));

        await act(() => result.current.submit(submitEvent()));

        expect(post).not.toHaveBeenCalled();
    });
});
