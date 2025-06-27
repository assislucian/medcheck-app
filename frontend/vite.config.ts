import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    proxy: {
      // Redireciona todas as chamadas da API para o backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Redireciona chamada de token para o backend
      '/token': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),

  // 🆕 Diretivas para evitar erro de resolução
  optimizeDeps: { include: ['jspdf', 'jspdf-autotable'] },
  ssr: { noExternal: ['jspdf', 'jspdf-autotable'] },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      'src/components/sidenav/__tests__/**',
      'src/components/upload/__tests__/**',
      'src/pages/__tests__/**',
      'src/test/smoke/**',
      'src/test/layout-*.e2e.ts',
    ],
  },
}));
