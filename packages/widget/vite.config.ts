import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'ChatbotWidget',
      fileName: 'chatbot-widget',
      formats: ['iife'], 
    },
    rollupOptions: {
      // Make sure external deps are bundled into the single file for the widget
      // We do NOT want to externalize react/react-dom because the host site might not have them
      external: [], 
    },
    // Minify for production
    minify: true,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
