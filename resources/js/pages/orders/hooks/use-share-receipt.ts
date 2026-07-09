import { copyImageToClipboard } from '@/lib/clipboard';
import {
    downloadBlob,
    receiptContent,
    receiptShareText,
    renderReceiptImage,
} from '@/lib/receipt';
import { waShareUrl } from '@/lib/whatsapp';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Shares the payment receipt image. Strategy, best first:
 * 1. Native share sheet with the PNG attached (mobile): the user picks
 *    WhatsApp and the image arrives as a photo.
 * 2. Copy the PNG to the clipboard and open the WhatsApp chat: the
 *    user pastes it with Ctrl+V (modern desktop browsers).
 * 3. Download the PNG and open the chat: the user attaches it by hand.
 */
export function useShareReceipt() {
    const [sharing, setSharing] = useState(false);

    const share = async ({
        payment,
        order,
    }: {
        payment: Payment;
        order: Order;
    }) => {
        setSharing(true);

        try {
            const input = { payment, order };
            const blob = await renderReceiptImage(input);
            const fileName = receiptContent(input).fileName;
            const text = receiptShareText(input);
            const file = new File([blob], fileName, { type: 'image/png' });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], text });
                return;
            }

            const openChat = () =>
                window.open(
                    waShareUrl(order.client.phone, text),
                    '_blank',
                    'noopener',
                );

            if (await copyImageToClipboard(blob)) {
                openChat();
                toast.info(
                    'Comprobante copiado: pegalo con Ctrl+V en el chat de WhatsApp',
                );
                return;
            }

            downloadBlob(blob, fileName);
            openChat();
            toast.info(
                'Se descargó la imagen del comprobante: adjuntala en el chat de WhatsApp',
            );
        } catch (error) {
            // The user closed the native share sheet: not an error
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            toast.error('No se pudo compartir el comprobante');
        } finally {
            setSharing(false);
        }
    };

    return { share, sharing };
}
