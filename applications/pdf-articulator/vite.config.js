import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Mount path equals "/" + package name for generalized hosting
  base: '/pdf-articulator/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          pdf: ['pdf-lib', 'pdfjs-dist'],
        },
      },
    },
    // PDF.js library we are using is 900KB so I guess thats our floor.
    chunkSizeWarningLimit: 1024,
  },
});
