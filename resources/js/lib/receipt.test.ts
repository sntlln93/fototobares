import { describe, expect, it } from 'vitest';
import { receiptContent, receiptShareText } from './receipt';

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

describe('receiptContent', () => {
    it('describes the receipt with the payment and order data', () => {
        const content = receiptContent({ payment, order });

        expect(content.title).toBe('Fototobares');
        expect(content.subtitle).toBe('Comprobante de pago N° 12');
        expect(content.rows).toContainEqual(['Cliente', 'Carla López']);
        expect(content.rows).toContainEqual(['Pedido', '#3']);
        expect(content.rows).toContainEqual(['Escuela', 'Escuela Test (a 5)']);
        expect(content.rows).toContainEqual(['Niño/a', 'Luca']);
        expect(content.rows).toContainEqual(['Fecha', '06/07/2026']);
        expect(content.fileName).toBe('comprobante-pago-12-pedido-3.png');
    });

    it('omits the child row when the order has no child name', () => {
        const content = receiptContent({
            payment,
            order: { ...order, child_name: undefined } as Order,
        });

        expect(content.rows.map(([label]) => label)).not.toContain('Niño/a');
    });

    it('shows the pending balance when the order is not fully paid', () => {
        const content = receiptContent({ payment, order });

        expect(content.balance.pending).toBe(true);
        expect(content.balance.text).toContain('7.000');
    });

    it('reports no pending balance when the order is fully paid', () => {
        const content = receiptContent({
            payment,
            order: { ...order, paid_total: 12000 } as Order,
        });

        expect(content.balance.pending).toBe(false);
        expect(content.balance.text).toBe(
            'Pedido cancelado (sin saldo pendiente)',
        );
    });
});

describe('receiptShareText', () => {
    it('builds the WhatsApp message with the receipt summary', () => {
        const text = receiptShareText({ payment, order });

        expect(text).toContain('Comprobante de pago N° 12 — Fototobares');
        expect(text).toContain('Cliente: Carla López');
        expect(text).toContain('Importe abonado: ');
        expect(text).toContain('Saldo pendiente: ');
    });
});
