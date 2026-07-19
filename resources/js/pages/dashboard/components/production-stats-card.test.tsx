import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductionStat } from '../hooks/use-dashboard';
import { ProductionStatsCard } from './production-stats-card';

describe('ProductionStatsCard', () => {
    it('renders each product with its total and variant breakdown', () => {
        const productionStats: ProductionStat[] = [
            {
                product: 'Banda',
                total: 3,
                variants: [
                    { label: 'Negro', count: 2 },
                    { label: 'Blanco', count: 1 },
                ],
            },
        ];

        render(<ProductionStatsCard productionStats={productionStats} />);

        expect(screen.getByText('Banda')).toBeTruthy();
        expect(screen.getByText('3')).toBeTruthy();

        const list = screen.getByText('Negro').closest('ul');
        expect(list).toBeTruthy();
        expect(within(list as HTMLElement).getByText('Negro')).toBeTruthy();
        expect(within(list as HTMLElement).getByText('2')).toBeTruthy();
        expect(within(list as HTMLElement).getByText('Blanco')).toBeTruthy();
        expect(within(list as HTMLElement).getByText('1')).toBeTruthy();
    });

    it('shows an empty state when there are no production stats', () => {
        render(<ProductionStatsCard productionStats={[]} />);

        expect(
            screen.getByText('Sin unidades en producción por el momento.'),
        ).toBeTruthy();
    });
});
