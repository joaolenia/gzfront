import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  clearScreen: false,
  
  server: {
    strictPort: true,
    port: 5173,
    host: true,
  },
  
  envPrefix: ['VITE_', 'TAURI_'],
  
  build: {
    target: 'es2021',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});