import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // .env.[mode] dan o'qiymiz. Dev proxy lokal backendga ishlaydi.
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8000'

  return {
  plugins: [react()],
  optimizeDeps: {
    include: ['@radix-ui/react-select']
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    alias: {
      'js-cookie': path.resolve(__dirname, 'node_modules/js-cookie/dist/js.cookie.mjs'),
      '@zxing/browser': path.resolve(__dirname, 'node_modules/@zxing/browser/esm/index.js'),
      '@zxing/library': path.resolve(__dirname, 'node_modules/@zxing/library/esm/index.js'),
      'react-qr-barcode-scanner': path.resolve(
        __dirname,
        'node_modules/react-qr-barcode-scanner/dist/index.js',
      ),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  }
})
