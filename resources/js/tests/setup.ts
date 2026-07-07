import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Without vitest globals, testing-library cannot register its own cleanup
afterEach(() => cleanup());

// jsdom does not implement matchMedia, required by the sidebar's
// useIsMobile hook and other responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
