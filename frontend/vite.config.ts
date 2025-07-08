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
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
          ],
          router: ['react-router-dom'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'clsx', 'classnames'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          chart: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable', 'pdfjs-dist'],
          excel: ['exceljs'],
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Otimizações para dependências
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'react', 'react-dom', 'exceljs'],
    exclude: ['@supabase/supabase-js'],
  },
  ssr: {
    noExternal: ['jspdf', 'jspdf-autotable', 'exceljs'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Define configurações específicas para produção
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development',
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

  preview: {
    port: 8080,
    host: true,
  },
}));
