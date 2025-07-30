import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/', // assets absolutos: /assets/...
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://medcheck-backend.onrender.com',
        changeOrigin: true,
      },
      '/token': {
        target: 'https://medcheck-backend.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
