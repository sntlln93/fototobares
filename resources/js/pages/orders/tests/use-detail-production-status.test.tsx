import { router } from '@inertiajs/react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetailProductionStatus } from '../hooks/use-detail-production-status';

vi.mock('@inertiajs/react', () => ({
    router: { put: vi.fn() },
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

vi.stubGlobal(
    'route',
    (name: string, params?: Record<string, unknown>) =>
        `http://localhost/${name}/${params?.order ?? ''}`,
);

const put = vi.mocked(router.put);

const lastPutOptions = () =>
    put.mock.calls.at(-1)?.[2] as unknown as {
        preserveScroll?: boolean;
        onSuccess?: () => void;
        onError?: (errors: Record<string, string>) => void;
    };

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useDetailProductionStatus', () => {
    it('enables production with a null status', () => {
        const { result } = renderHook(() => useDetailProductionStatus(3));

        result.current.setStatus(11, null);

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.production-status/3',
            { detail_id: 11, production_status_id: null },
            expect.objectContaining({ preserveScroll: true }),
        );

        lastPutOptions().onSuccess?.();
        expect(toast.success).toHaveBeenCalledWith(
            'Estado de fabricación actualizado',
        );
    });

    it('moves the detail to a stage', () => {
        const { result } = renderHook(() => useDetailProductionStatus(3));

        result.current.setStatus(11, 7);

        expect(put).toHaveBeenCalledWith(
            'http://localhost/orders.production-status/3',
            { detail_id: 11, production_status_id: 7 },
            expect.anything(),
        );
    });

    it('surfaces the backend gate error as a toast', () => {
        const { result } = renderHook(() => useDetailProductionStatus(3));

        result.current.setStatus(11, null);
        lastPutOptions().onError?.({
            order: 'La fabricación se habilita cuando la primera cuota está paga.',
        });

        expect(toast.error).toHaveBeenCalledWith(
            'La fabricación se habilita cuando la primera cuota está paga.',
        );
    });
});
