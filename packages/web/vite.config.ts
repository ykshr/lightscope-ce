/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    server: { port: env.VITE_PORT ? parseInt(env.VITE_PORT, 10) : 3000 },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              'lucide-react',
              '@phosphor-icons/react',
            ],
            charts: [
              'recharts',
              'd3-geo',
              'd3-interpolate',
              'd3-selection',
              'd3-zoom',
              'topojson-client',
            ],
            date: ['date-fns', 'dayjs', 'react-day-picker'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      env: {
        VITE_API_URL: env.VITE_API_URL,
        VITE_PROXY_URL: env.VITE_PROXY_URL,
      },
    },
  };
});
