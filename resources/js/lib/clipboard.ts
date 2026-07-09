/**
 * Copies an image blob to the system clipboard. Returns false when the
 * Async Clipboard API is unavailable or the write is not allowed, so
 * callers can degrade to another strategy.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
    if (
        typeof ClipboardItem === 'undefined' ||
        typeof navigator.clipboard?.write !== 'function'
    ) {
        return false;
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);

        return true;
    } catch {
        return false;
    }
}
