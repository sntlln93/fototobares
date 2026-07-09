import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailCard } from '../components/detail-card';
import { TrackingDetail } from '../components/product-group';

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const makeDetail = (
    overrides: Partial<TrackingDetail> = {},
): TrackingDetail => ({
    id: 11,
    order_id: 3,
    child_name: 'Lola',
    client_name: 'Carla Medina',
    school: 'Escuela Normal',
    classroom: '6to a',
    photo_number: 3,
    attended_photo_session: true,
    product_id: 1,
    product_name: 'Moldura fina',
    product_type_id: 1,
    product_type: 'mural',
    variant: { color: 'black', orientation: 'vertical' },
    note: 'Lola - egresados 2026',
    production_status_id: 5,
    production_status: 'Impreso',
    position: 2,
    priority: false,
    status_updated_at: '10/07/2026',
    ...overrides,
});

const next: ProductionStatus = {
    id: 6,
    name: 'Pegado',
    position: 3,
} as ProductionStatus;

describe('DetailCard', () => {
    it('shows the order, child, school, variant and note', () => {
        render(
            <DetailCard
                detail={makeDetail()}
                next={next}
                checked={false}
                onToggle={vi.fn()}
                onApplyStatus={vi.fn()}
            />,
        );

        expect(screen.getByText('#3')).toBeTruthy();
        expect(screen.getByText('(foto 3)')).toBeTruthy();
        expect(screen.getByText('Lola')).toBeTruthy();
        expect(screen.getByText('Escuela Normal (6TO A)')).toBeTruthy();
        expect(screen.getByText('black · vertical')).toBeTruthy();
        expect(screen.getByText('Lola - egresados 2026')).toBeTruthy();
        expect(screen.getByText('Impreso')).toBeTruthy();
    });

    it('advances to the next status from the card button', () => {
        const onApplyStatus = vi.fn();

        render(
            <DetailCard
                detail={makeDetail()}
                next={next}
                checked={false}
                onToggle={vi.fn()}
                onApplyStatus={onApplyStatus}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Pegado/ }));

        expect(onApplyStatus).toHaveBeenCalledWith(6, [11], 'Pegado');
    });

    it('shows "Listo para entregar" when there is no next status', () => {
        render(
            <DetailCard
                detail={makeDetail()}
                next={undefined}
                checked={false}
                onToggle={vi.fn()}
                onApplyStatus={vi.fn()}
            />,
        );

        expect(screen.getByText('Listo para entregar')).toBeTruthy();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('toggles selection from the checkbox', () => {
        const onToggle = vi.fn();

        render(
            <DetailCard
                detail={makeDetail()}
                next={next}
                checked={false}
                onToggle={onToggle}
                onApplyStatus={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('checkbox'));

        expect(onToggle).toHaveBeenCalled();
    });
});
