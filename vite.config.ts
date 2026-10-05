import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Pre-bundle lazily imported deps up front so they share one React copy in dev.
    include: [
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      '@radix-ui/react-label',
      'dayjs',
      'framer-motion',
      'embla-carousel-react',
      'embla-carousel-autoplay',
    ],
  },
  server: {
    port: 5180,
    strictPort: true,
  },
  preview: {
    port: 5180,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          data: ['@tanstack/react-query', '@reduxjs/toolkit', 'react-redux', 'axios'],
          ui: ['@radix-ui/react-dropdown-menu', 'lucide-react', 'sonner'],
        },
      },
    },
  },
});
