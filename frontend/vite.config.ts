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
        target:
          mode === 'production'
            ? 'https://medcheck-app-medcheck.up.railway.app'
            : 'http://localhost:8000',
        changeOrigin: true,
        secure: true,
      },
      // Redireciona chamada de token para o backend
      '/token': {
        target:
          mode === 'production'
            ? 'https://medcheck-app-medcheck.up.railway.app'
            : 'http://localhost:8000',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),

  // Configurações de build otimizadas para Vercel
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'lucide-react',
          ],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          pdf: ['jspdf', 'jspdf-autotable'],
          excel: ['xlsx'],
        },
      },
    },
  },

  // 🆕 Diretivas para evitar erro de resolução
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'react', 'react-dom', 'xlsx'],
  },
  ssr: {
    noExternal: ['jspdf', 'jspdf-autotable', 'xlsx'],
  },
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
