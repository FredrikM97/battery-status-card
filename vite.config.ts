import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'ES2023',
    lib: {
      entry: 'src/main.ts',
      name: 'BatteryStatusCard',
      fileName: 'battery-status-card',
      formats: ['es'],
    },
    minify: 'terser',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      TZ: 'Etc/UTC',
      IS_TEST: 'true',
    },
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.mjs'],
      exclude: ['node_modules/', 'dist/', 'tests/'],
    },
  },
});
