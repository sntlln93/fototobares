import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusItem } from '../components/status-item';
import { StatusRow } from '../hooks/use-status-actions';

const status: StatusRow = {
    id: 1,
    name: 'Pegado',
    position: 2,
    details_count: 0,
    stockables: [
        { id: 10, name: 'Planchas de MDF', unit: 'Unidad', quantity: -2 },
        { id: 11, name: 'Murales armados', unit: 'Unidad', quantity: 1 },
    ],
};

describe('StatusItem', () => {
    it('prefixes consumed stockables with a minus and produced ones with a plus', () => {
        render(
            <StatusItem
                status={status}
                isFirst={false}
                isLast={false}
                isOnly={false}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onRename={vi.fn()}
                onEditConsumption={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByText(/-2× Planchas de MDF/)).toBeTruthy();
        expect(screen.getByText(/\+1× Murales armados/)).toBeTruthy();
    });

    it('renders no summary line for a stage that moves nothing', () => {
        render(
            <StatusItem
                status={{ ...status, stockables: [] }}
                isFirst={false}
                isLast={false}
                isOnly={false}
                onMoveUp={vi.fn()}
                onMoveDown={vi.fn()}
                onRename={vi.fn()}
                onEditConsumption={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.queryByText(/×/)).toBeNull();
    });
});
