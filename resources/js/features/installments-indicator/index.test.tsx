import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstallmentsIndicator } from './index';

describe('InstallmentsIndicator', () => {
    it('renders exactly paymentPlan square elements', () => {
        const { container } = render(
            <InstallmentsIndicator paymentPlan={5} paidInstallments={0} />,
        );

        expect(container.querySelectorAll('span.relative')).toHaveLength(5);
    });

    it('fully fills paid squares and leaves the rest empty', () => {
        const { container } = render(
            <InstallmentsIndicator paymentPlan={4} paidInstallments={2} />,
        );

        const squares = container.querySelectorAll('span.relative');
        expect(squares).toHaveLength(4);

        [0, 1].forEach((index) => {
            const overlay = squares[index].querySelector('span');
            expect(overlay).not.toBeNull();
            expect((overlay as HTMLElement).style.height).toBe('100%');
        });

        [2, 3].forEach((index) => {
            expect(squares[index].querySelector('span')).toBeNull();
            expect(squares[index].classList.contains('border')).toBe(true);
        });
    });

    it('partially fills the in-progress square to the given fraction', () => {
        const { container } = render(
            <InstallmentsIndicator
                paymentPlan={4}
                paidInstallments={1}
                currentInstallmentFraction={0.37}
            />,
        );

        const squares = container.querySelectorAll('span.relative');
        const overlay = squares[1].querySelector('span');

        expect(overlay).not.toBeNull();
        expect((overlay as HTMLElement).style.height).toBe('37%');
    });

    it('renders the in-progress square empty when the fraction is omitted', () => {
        const { container } = render(
            <InstallmentsIndicator paymentPlan={4} paidInstallments={1} />,
        );

        const squares = container.querySelectorAll('span.relative');

        expect(squares[1].querySelector('span')).toBeNull();
        expect(squares[1].classList.contains('border')).toBe(true);
    });

    it('fills every square and leaves none partial when fully paid', () => {
        const { container } = render(
            <InstallmentsIndicator paymentPlan={4} paidInstallments={4} />,
        );

        const squares = container.querySelectorAll('span.relative');
        expect(squares).toHaveLength(4);

        squares.forEach((square) => {
            const overlay = square.querySelector('span');
            expect(overlay).not.toBeNull();
            expect((overlay as HTMLElement).style.height).toBe('100%');
        });
    });

    it('uses square (non-rounded) corners', () => {
        const { container } = render(
            <InstallmentsIndicator paymentPlan={1} paidInstallments={0} />,
        );

        const square = container.querySelector('span.relative');
        expect(square?.classList.contains('rounded-none')).toBe(true);
        expect(square?.classList.contains('rounded-sm')).toBe(false);
    });
});
