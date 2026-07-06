import { formatPrice } from '@/lib/utils';
import { jsPDF } from 'jspdf';

/**
 * Generates and downloads the Fototobares payment receipt as a PDF,
 * built entirely client-side.
 */
export function downloadPaymentReceipt({
    payment,
    order,
}: {
    payment: Payment;
    order: Order;
}) {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Fototobares', margin, y);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Comprobante de pago N° ${payment.id}`, pageWidth - margin, y, {
        align: 'right',
    });

    y += 6;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;
    doc.setFontSize(11);

    const rows: Array<[string, string]> = [
        ['Fecha', payment.paid_on ?? payment.paid_at],
        ['Cliente', order.client.name],
        ['Pedido', `#${order.id}`],
        ['Escuela', `${order.school.name} (${order.classroom.name})`],
        ...(order.child_name
            ? [['Niño/a', order.child_name] as [string, string]]
            : []),
        ['Medio de pago', payment.type],
    ];

    rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 35, y);
        y += 7;
    });

    y += 4;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Importe abonado', margin + 2, y + 2.5);
    doc.text(formatPrice(payment.amount), pageWidth - margin - 2, y + 2.5, {
        align: 'right',
    });

    y += 16;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const paidTotal = order.paid_total ?? 0;
    const balance = order.total_price - paidTotal;

    doc.text(`Total del pedido: ${formatPrice(order.total_price)}`, margin, y);
    y += 6;
    doc.text(`Total abonado a la fecha: ${formatPrice(paidTotal)}`, margin, y);
    y += 6;
    doc.setFont('helvetica', balance > 0 ? 'bold' : 'normal');
    doc.text(
        balance > 0
            ? `Saldo pendiente: ${formatPrice(balance)}`
            : 'Pedido cancelado (sin saldo pendiente)',
        margin,
        y,
    );

    y += 14;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Gracias por confiar en Fototobares.', pageWidth / 2, y, {
        align: 'center',
    });

    doc.save(`comprobante-pago-${payment.id}-pedido-${order.id}.pdf`);
}
