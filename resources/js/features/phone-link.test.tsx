import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhoneLink } from './phone-link';

describe('PhoneLink', () => {
    it('shows the phone with a link to its whatsapp chat', () => {
        render(<PhoneLink phone="380 400-0003" />);

        const link = screen.getByRole('link', {
            name: 'Abrir chat de WhatsApp con 380 400-0003',
        });

        expect(link.getAttribute('href')).toBe('https://wa.me/5493804000003');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(screen.getByText('380 400-0003')).toBeDefined();
    });

    it('shows a phone that cannot be dialed as plain text', () => {
        render(<PhoneLink phone="1234" />);

        expect(screen.queryByRole('link')).toBe(null);
        expect(screen.getByText('1234')).toBeDefined();
    });

    it('shows nothing to call when there is no phone', () => {
        render(<PhoneLink phone={null} />);

        expect(screen.queryByRole('link')).toBe(null);
        expect(screen.getByText('N/A')).toBeDefined();
    });

    it('marks the digits matching the search term', () => {
        const { container } = render(
            <PhoneLink phone="380 400-0003" term="4000003" />,
        );

        expect(container.querySelector('mark')?.textContent).toBe('400-0003');
    });
});
