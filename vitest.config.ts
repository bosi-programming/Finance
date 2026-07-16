import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: 'istanbul',
      enabled: true,
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: './src/test/setup.ts',
          include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx'],
        },
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
          },
        },
      },
    ],
  },
});
