/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 4000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5009', // Match backend port in launchSettings.json
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    build: {
      outDir: '../backend/TradeMatrix.Server/wwwroot',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
            'vendor-table':  ['@tanstack/react-table'],
            'vendor-ui': [
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
            ],
            'vendor-misc': ['axios', 'qrcode.react'],
          },
        },
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@features': path.resolve(__dirname, 'features'),
        '@components': path.resolve(__dirname, 'components'),
        '@lib': path.resolve(__dirname, 'lib'),
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
    }
  };
});
