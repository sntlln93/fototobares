import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// 1. Limpiar mocks y DOM después de cada test
afterEach(() => {
    cleanup();
    vi.restoreAllMocks(); // Restaura el comportamiento original de spys/mocks
    vi.clearAllMocks(); // Limpia el historial de llamadas (.toHaveBeenCalled())

    // Limpieza crítica para evitar persistencia de layouts entre archivos
    document.body.innerHTML = '';
    localStorage.clear();
    sessionStorage.clear();
});

// 2. Opcional: Forzar recarga de módulos si mutas estados internos
beforeEach(() => {
    vi.resetModules();
});

// jsdom does not implement ResizeObserver, required by the masonry layout
vi.stubGlobal(
    'ResizeObserver',
    class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
);

// jsdom does not implement scrollIntoView (required by cmdk's command
// list) nor the pointer-capture APIs Radix Select needs to open its listbox
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.releasePointerCapture = vi.fn();

// jsdom does not implement matchMedia, required by the sidebar's
// useIsMobile hook and other responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true, // Permitir que Vitest lo limpie/sobreescriba si es necesario
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
