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
            ? 'https://medcheck-backend.onrender.com'
            : 'http://localhost:8000',
        changeOrigin: true,
        secure: true,
      },
      // Redireciona chamada de token para o backend
      '/token': {
        target:
          mode === 'production'
            ? 'https://medcheck-backend.onrender.com'
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

  // Configurações críticas para resolver problemas de forwardRef
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development',
    // Garantir que React está disponível globalmente
    global: 'globalThis',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Configurações para resolver conflitos de React
    dedupe: ['react', 'react-dom'],
  },

  // Configurações de build otimizadas para performance
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Aumentar limite para evitar warnings desnecessários
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Configurações mais robustas para evitar problemas de bundling
      external: (id) => {
        // Não externalizar nada para evitar problemas de referência
        return false;
      },
      output: {
        manualChunks: (id) => {
          // React e ReactDOM sempre juntos no vendor principal
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }

          // Separar dependências de forma mais inteligente
          if (id.includes('node_modules')) {
            // Bibliotecas de PDF em chunk separado
            if (
              id.includes('jspdf') ||
              id.includes('pdfjs') ||
              id.includes('html2canvas')
            ) {
              return 'pdf';
            }
            // Bibliotecas de Excel em chunk separado
            if (id.includes('exceljs') || id.includes('xlsx')) {
              return 'excel';
            }
            // Bibliotecas de UI em chunk separado
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui';
            }
            // Bibliotecas de gráficos em chunk separado
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'chart';
            }
            // Router em chunk separado
            if (id.includes('react-router')) {
              return 'router';
            }
            // Forms em chunk separado
            if (
              id.includes('react-hook-form') ||
              id.includes('zod') ||
              id.includes('@hookform')
            ) {
              return 'forms';
            }
            // Utilitários de data e formatação
            if (
              id.includes('date-fns') ||
              id.includes('format') ||
              id.includes('clsx')
            ) {
              return 'utils';
            }
            // Query em chunk separado
            if (id.includes('@tanstack')) {
              return 'query';
            }
            // Supabase em chunk separado
            if (id.includes('supabase')) {
              return 'supabase';
            }
            // Outras dependências node_modules
            return 'vendor';
          }

          // Páginas grandes em chunks separados
          if (id.includes('/pages/Demonstratives')) {
            return 'page-demonstratives';
          }
          if (id.includes('/pages/Dashboard')) {
            return 'page-dashboard';
          }
          if (id.includes('/pages/Reports')) {
            return 'page-reports';
          }
          if (id.includes('/pages/Profile')) {
            return 'page-profile';
          }

          // Componentes pesados em chunks separados
          if (id.includes('/components/dashboard')) {
            return 'dashboard-components';
          }
          if (id.includes('/components/reports')) {
            return 'reports-components';
          }
          if (id.includes('/components/upload')) {
            return 'upload-components';
          }
        },
      },
    },
    sourcemap: false, // Desabilitar sourcemap em produção para reduzir tamanho
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        // Preservar nomes críticos do React para evitar problemas
        reserved: [
          'React',
          'ReactDOM',
          'forwardRef',
          'useState',
          'useEffect',
          'useCallback',
          'useMemo',
        ],
      },
    },
  },

  // Otimizações críticas para dependências React
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      // Forçar pré-bundling de dependências críticas
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: ['@supabase/supabase-js', 'jspdf', 'jspdf-autotable'],
    // Força Vite a reprocessar dependências se mudaram
    force: true,
  },

  // Configurações SSR para evitar problemas de hidratação
  ssr: {
    noExternal: ['jspdf', 'jspdf-autotable', 'exceljs'],
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

  // Configurações críticas para o preview/produção
  preview: {
    port: 8080,
    host: true,
    allowedHosts: [
      'medcheck-frontend.onrender.com',
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.onrender.com', // Permite qualquer subdomínio do Render
    ],
    // Configurações para resolver problemas de CORS e CSP
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
}));
