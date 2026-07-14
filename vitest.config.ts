import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    test: {
        environment: 'jsdom',
        // The app runs in Argentina (UTC−3): dates behave there, not in UTC
        env: { TZ: 'America/Argentina/Buenos_Aires' },
        include: ['resources/js/**/*.test.{ts,tsx}'],
        setupFiles: ['resources/js/tests/setup.ts'],
    },
});
