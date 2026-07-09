import { formatPrice } from '@/lib/utils';

type ReceiptInput = {
    payment: Payment;
    order: Order;
};

type ReceiptContent = {
    title: string;
    subtitle: string;
    rows: Array<[string, string]>;
    amountLabel: string;
    amount: string;
    totals: string[];
    balance: { text: string; pending: boolean };
    footer: string;
    fileName: string;
};

/**
 * Pure description of the Fototobares payment receipt; the canvas
 * renderer and the WhatsApp share text derive from it.
 */
export function receiptContent({
    payment,
    order,
}: ReceiptInput): ReceiptContent {
    const paidTotal = order.paid_total ?? 0;
    const balance = order.total_price - paidTotal;

    return {
        title: 'Fototobares',
        subtitle: `Comprobante de pago N° ${payment.id}`,
        rows: [
            ['Fecha', payment.paid_on ?? payment.paid_at],
            ['Cliente', order.client.name],
            ['Pedido', `#${order.id}`],
            ['Escuela', `${order.school.name} (${order.classroom.name})`],
            ...(order.child_name
                ? [['Niño/a', order.child_name] as [string, string]]
                : []),
            ['Medio de pago', payment.type],
        ],
        amountLabel: 'Importe abonado',
        amount: formatPrice(payment.amount),
        totals: [
            `Total del pedido: ${formatPrice(order.total_price)}`,
            `Total abonado a la fecha: ${formatPrice(paidTotal)}`,
        ],
        balance: {
            text:
                balance > 0
                    ? `Saldo pendiente: ${formatPrice(balance)}`
                    : 'Pedido cancelado (sin saldo pendiente)',
            pending: balance > 0,
        },
        footer: 'Gracias por confiar en Fototobares.',
        fileName: `comprobante-pago-${payment.id}-pedido-${order.id}.png`,
    };
}

/**
 * Plain-text version of the receipt for the WhatsApp message body.
 */
export function receiptShareText(input: ReceiptInput): string {
    const content = receiptContent(input);

    return [
        `${content.subtitle} — ${content.title}`,
        ...content.rows.map(([label, value]) => `${label}: ${value}`),
        `${content.amountLabel}: ${content.amount}`,
        ...content.totals,
        content.balance.text,
    ].join('\n');
}

/* Layout constants, in canvas points (A5-ish, 2x for sharpness) */
const WIDTH = 740;
const HEIGHT = 1050;
const SCALE = 2;
const MARGIN = 70;

const font = (size: number, style = '') =>
    `${style ? `${style} ` : ''}${size}px -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

/**
 * Renders the receipt to a PNG, built entirely client-side.
 */
export function renderReceiptImage(input: ReceiptInput): Promise<Blob> {
    const content = receiptContent(input);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH * SCALE;
    canvas.height = HEIGHT * SCALE;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Canvas 2D context unavailable'));
    }

    ctx.scale(SCALE, SCALE);
    draw(ctx, content);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Could not export the receipt image'));
            }
        }, 'image/png');
    });
}

function draw(ctx: CanvasRenderingContext2D, content: ReceiptContent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textBaseline = 'alphabetic';

    let y = 110;

    ctx.fillStyle = '#111111';
    ctx.font = font(48, 'bold');
    ctx.fillText(content.title, MARGIN, y);

    ctx.font = font(26);
    ctx.textAlign = 'right';
    ctx.fillText(content.subtitle, WIDTH - MARGIN, y);
    ctx.textAlign = 'left';

    y += 30;
    ctx.strokeStyle = '#b4b4b4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(WIDTH - MARGIN, y);
    ctx.stroke();

    y += 60;

    for (const [label, value] of content.rows) {
        ctx.font = font(26, 'bold');
        ctx.fillText(`${label}:`, MARGIN, y);
        ctx.font = font(26);
        ctx.fillText(value, MARGIN + 220, y);
        y += 44;
    }

    y += 20;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(MARGIN, y - 38, WIDTH - MARGIN * 2, 62);
    ctx.fillStyle = '#111111';
    ctx.font = font(30, 'bold');
    ctx.fillText(content.amountLabel, MARGIN + 12, y + 4);
    ctx.textAlign = 'right';
    ctx.fillText(content.amount, WIDTH - MARGIN - 12, y + 4);
    ctx.textAlign = 'left';

    y += 90;
    ctx.font = font(24);

    for (const total of content.totals) {
        ctx.fillText(total, MARGIN, y);
        y += 38;
    }

    ctx.font = font(24, content.balance.pending ? 'bold' : '');
    ctx.fillText(content.balance.text, MARGIN, y);

    y += 80;
    ctx.fillStyle = '#787878';
    ctx.font = font(22, 'italic');
    ctx.textAlign = 'center';
    ctx.fillText(content.footer, WIDTH / 2, y);
    ctx.textAlign = 'left';
}

/**
 * Triggers a browser download for an already-rendered receipt blob.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Generates and downloads the receipt as a PNG.
 */
export async function downloadPaymentReceipt(
    input: ReceiptInput,
): Promise<void> {
    downloadBlob(
        await renderReceiptImage(input),
        receiptContent(input).fileName,
    );
}
