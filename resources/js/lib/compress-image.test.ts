import { afterEach, describe, expect, it, vi } from 'vitest';
import { compressImage } from './compress-image';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('compressImage', () => {
    it('falls back to the original file when the canvas 2d context is unavailable', async () => {
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            null,
        );
        vi.stubGlobal(
            'Image',
            class {
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                width = 100;
                height = 100;
                set src(_value: string) {
                    this.onload?.();
                }
            },
        );

        const original = new File(['data'], 'foto.jpg', {
            type: 'image/jpeg',
        });

        const result = await compressImage(original);

        expect(result).toBe(original);
    });

    it('falls back to the original file when the image fails to load', async () => {
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        vi.stubGlobal(
            'Image',
            class {
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                set src(_value: string) {
                    this.onerror?.();
                }
            },
        );

        const original = new File(['data'], 'foto.jpg', {
            type: 'image/jpeg',
        });

        await expect(compressImage(original)).resolves.toBe(original);
    });
});
