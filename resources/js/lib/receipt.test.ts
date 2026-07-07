import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPaymentReceipt } from './receipt';

const pdf = vi.hoisted(() => ({
    texts: [] as string[],
    saved: [] as string[],
}));

vi.mock('jspdf', () => ({
    jsPDF: class {
        internal = { pageSize: { getWidth: () => 148 } };

        setFont() {}

        setFontSize() {}

        setDrawColor() {}

        setFillColor() {}

        setTextColor() {}

        line() {}

        rect() {}

        text(value: string | string[]) {
            pdf.texts.push(String(value));
        }

        save(filename: string) {
            pdf.saved.push(filename);
        }
    },
}));

const order = {
    id: 3,
    total_price: 12000,
    paid_total: 5000,
    child_name: 'Luca',
    client: { name: 'Carla López', phone: '3804000003' },
    school: { name: 'Escuela Test' },
    classroom: { name: 'a 5' },
} as Order;

const payment = {
    id: 12,
    order_id: 3,
    amount: 5000,
    type: 'transferencia',
    paid_at: 'hace 2 días',
    paid_on: '06/07/2026',
    proof_of_payment: null,
} as Payment;

beforeEach(() => {
    pdf.texts.length = 0;
    pdf.saved.length = 0;
});

describe('downloadPaymentReceipt', () => {
    it('renders the receipt data and downloads it with a descriptive name', () => {
        downloadPaymentReceipt({ payment, order });

        const content = pdf.texts.join('\n');

        expect(content).toContain('Fototobares');
        expect(content).toContain('Comprobante de pago N° 12');
        expect(content).toContain('Carla López');
        expect(content).toContain('#3');
        expect(content).toContain('Escuela Test (a 5)');
        expect(content).toContain('Luca');
        expect(content).toContain('06/07/2026');
        expect(pdf.saved).toEqual(['comprobante-pago-12-pedido-3.pdf']);
    });

    it('shows the pending balance when the order is not fully paid', () => {
        downloadPaymentReceipt({ payment, order });

        const balanceLine = pdf.texts.find((text) =>
            text.startsWith('Saldo pendiente:'),
        );

        expect(balanceLine).toContain('7.000');
    });

    it('reports no pending balance when the order is fully paid', () => {
        downloadPaymentReceipt({
            payment,
            order: { ...order, paid_total: 12000 } as Order,
        });

        expect(pdf.texts).toContain('Pedido cancelado (sin saldo pendiente)');
    });
});
