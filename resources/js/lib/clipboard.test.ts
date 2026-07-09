import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyImageToClipboard } from './clipboard';

const blob = new Blob(['png'], { type: 'image/png' });

class FakeClipboardItem {
    constructor(public readonly data: Record<string, Blob>) {}
}

afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'clipboard');
});

describe('copyImageToClipboard', () => {
    it('returns false when the async clipboard api is unavailable', async () => {
        await expect(copyImageToClipboard(blob)).resolves.toBe(false);
    });

    it('writes the image and returns true', async () => {
        vi.stubGlobal('ClipboardItem', FakeClipboardItem);
        const write = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { write } });

        await expect(copyImageToClipboard(blob)).resolves.toBe(true);

        const [items] = write.mock.calls[0] as [FakeClipboardItem[]];
        expect(items[0].data['image/png']).toBe(blob);
    });

    it('returns false when the write is rejected', async () => {
        vi.stubGlobal('ClipboardItem', FakeClipboardItem);
        Object.assign(navigator, {
            clipboard: { write: vi.fn().mockRejectedValue(new Error('nope')) },
        });

        await expect(copyImageToClipboard(blob)).resolves.toBe(false);
    });
});
