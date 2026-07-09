import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useShareReceipt } from '../hooks/use-share-receipt';

const receipt = vi.hoisted(() => ({
    blob: new Blob(['png'], { type: 'image/png' }),
    download: vi.fn(),
}));

vi.mock('@/lib/receipt', () => ({
    renderReceiptImage: vi.fn().mockResolvedValue(receipt.blob),
    receiptContent: vi
        .fn()
        .mockReturnValue({ fileName: 'comprobante-pago-12-pedido-3.png' }),
    receiptShareText: vi.fn().mockReturnValue('Comprobante de pago N° 12'),
    downloadBlob: receipt.download,
}));

const clipboard = vi.hoisted(() => ({ copy: vi.fn() }));

vi.mock('@/lib/clipboard', () => ({ copyImageToClipboard: clipboard.copy }));

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

const order = {
    id: 3,
    client: { name: 'Carla López', phone: '3804123456' },
} as Order;

const payment = { id: 12 } as Payment;

describe('useShareReceipt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clipboard.copy.mockResolvedValue(false);
        vi.stubGlobal('open', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Reflect.deleteProperty(navigator, 'canShare');
        Reflect.deleteProperty(navigator, 'share');
    });

    it('shares the image through the native share sheet when available', async () => {
        const share = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            canShare: vi.fn().mockReturnValue(true),
            share,
        });

        const { result } = renderHook(() => useShareReceipt());

        await act(() => result.current.share({ payment, order }));

        const shared = share.mock.calls[0][0] as ShareData;
        expect(shared.text).toBe('Comprobante de pago N° 12');
        expect(shared.files?.[0].name).toBe('comprobante-pago-12-pedido-3.png');
        expect(clipboard.copy).not.toHaveBeenCalled();
        expect(receipt.download).not.toHaveBeenCalled();
        expect(window.open).not.toHaveBeenCalled();
    });

    it('copies the image and opens the chat when there is no native share', async () => {
        clipboard.copy.mockResolvedValue(true);

        const { result } = renderHook(() => useShareReceipt());

        await act(() => result.current.share({ payment, order }));

        expect(clipboard.copy).toHaveBeenCalledWith(receipt.blob);
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('https://wa.me/5493804123456?text='),
            '_blank',
            'noopener',
        );
        expect(receipt.download).not.toHaveBeenCalled();
        expect(toast.info).toHaveBeenCalledWith(
            expect.stringContaining('pegalo'),
        );
    });

    it('falls back to downloading when the clipboard is unavailable', async () => {
        const { result } = renderHook(() => useShareReceipt());

        await act(() => result.current.share({ payment, order }));

        expect(receipt.download).toHaveBeenCalledWith(
            receipt.blob,
            'comprobante-pago-12-pedido-3.png',
        );
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('https://wa.me/5493804123456?text='),
            '_blank',
            'noopener',
        );
        expect(toast.info).toHaveBeenCalledWith(
            expect.stringContaining('adjuntala'),
        );
    });

    it('stays quiet when the user closes the share sheet', async () => {
        Object.assign(navigator, {
            canShare: vi.fn().mockReturnValue(true),
            share: vi
                .fn()
                .mockRejectedValue(new DOMException('cancel', 'AbortError')),
        });

        const { result } = renderHook(() => useShareReceipt());

        await act(() => result.current.share({ payment, order }));

        expect(toast.error).not.toHaveBeenCalled();
    });

    it('reports unexpected failures', async () => {
        Object.assign(navigator, {
            canShare: vi.fn().mockReturnValue(true),
            share: vi.fn().mockRejectedValue(new Error('boom')),
        });

        const { result } = renderHook(() => useShareReceipt());

        await act(() => result.current.share({ payment, order }));

        expect(toast.error).toHaveBeenCalled();
    });
});
