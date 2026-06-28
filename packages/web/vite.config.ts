// reference should be here in order to provide test:{} object without an error
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
          manualChunks(id) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')
            ) {
              return 'vendor';
            }
            if (
              id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/@phosphor-icons/react')
            ) {
              return 'ui';
            }
            if (
              id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/topojson-client')
            ) {
              return 'charts';
            }
            if (
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/react-day-picker')
            ) {
              return 'date';
            }
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'query';
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      env: {
        VITE_API_URL: 'http://localhost:3001',
        VITE_PROXY_URL: 'http://localhost:3002',
      },
    },
  };
});
